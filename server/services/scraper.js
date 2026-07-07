import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// Add stealth plugin to avoid being blocked by Amazon/Flipkart
puppeteer.use(StealthPlugin())

/**
 * @param {string} url - The product URL
 * @returns {Promise<{ title: string, currentPrice: number, imageUrl: string, platform: string }>}
 */
export async function scrapeProduct(url) {
  let browser
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    let platform = 'generic'
    if (url.includes('amazon')) platform = 'amazon'
    else if (url.includes('flipkart')) platform = 'flipkart'

    const productData = await page.evaluate((platform) => {
      let title = ''
      let priceStr = ''
      let imageUrl = ''

      if (platform === 'amazon') {
        const titleEl = document.querySelector('#productTitle')
        title = titleEl ? titleEl.innerText.trim() : 'Unknown Amazon Product'

        // Try multiple price selectors as Amazon changes them frequently
        const priceSelectors = [
          '.a-price-whole',
          '#priceblock_ourprice',
          '#priceblock_dealprice',
          '.a-offscreen'
        ]
        
        for (const selector of priceSelectors) {
          const el = document.querySelector(selector)
          if (el && el.innerText) {
            priceStr = el.innerText
            break
          }
        }

        const imgEl = document.querySelector('#landingImage') || document.querySelector('#imgBlkFront')
        imageUrl = imgEl ? imgEl.src : ''
        
      } else if (platform === 'flipkart') {
        const titleEl = document.querySelector('h1')
        title = titleEl ? titleEl.innerText.trim() : 'Unknown Flipkart Product'

        // Trying to find elements containing the ₹ symbol that look like prices
        const priceEls = Array.from(document.querySelectorAll('div, span')).filter(el => 
          el.innerText && el.innerText.startsWith('₹') && el.children.length === 0
        )
        if (priceEls.length > 0) {
          // Sort by font size (largest is usually the main price)
          priceEls.sort((a, b) => {
            const sizeA = parseFloat(window.getComputedStyle(a).fontSize)
            const sizeB = parseFloat(window.getComputedStyle(b).fontSize)
            return sizeB - sizeA
          })
          priceStr = priceEls[0].innerText
        }

        // Image: Flipkart usually puts the main image inside a div with specific sizing, or we can use OG tags
        const ogImage = document.querySelector('meta[property="og:image"]')
        imageUrl = ogImage ? ogImage.content : ''
      } else {
        // Generic Fallback (Zara, Gucci, Nike, etc.)
        const ogTitle = document.querySelector('meta[property="og:title"]')
        title = ogTitle && ogTitle.content ? ogTitle.content : (document.title || 'Unknown Product')

        // 2. Image from OG Tag
        const ogImage = document.querySelector('meta[property="og:image"]')
        imageUrl = ogImage && ogImage.content ? ogImage.content : ''

        // 3. Price from standard e-commerce meta tags or visual heuristics
        const metaPrice = document.querySelector('meta[property="product:price:amount"]')
        if (metaPrice && metaPrice.content) {
          priceStr = metaPrice.content
        } else {
          const priceEls = Array.from(document.querySelectorAll('div, span, p, h1, h2, h3, h4')).filter(el => {
            const text = el.innerText || ''
            // Must contain currency symbol, have no children elements, and not be a giant paragraph
            return (text.includes('$') || text.includes('€') || text.includes('₹') || text.includes('£')) 
                   && el.children.length === 0 
                   && text.length < 20
          })
          
          if (priceEls.length > 0) {
            // Sort by font size to find the most prominent price
            priceEls.sort((a, b) => {
              const sizeA = parseFloat(window.getComputedStyle(a).fontSize) || 0
              const sizeB = parseFloat(window.getComputedStyle(b).fontSize) || 0
              return sizeB - sizeA
            })
            priceStr = priceEls[0].innerText
          }
        }
      }

      return { title, priceStr, imageUrl }
    }, platform)

    const cleanPriceStr = productData.priceStr.replace(/[^0-9.]/g, '')
    const currentPrice = parseFloat(cleanPriceStr)

    return {
      title: productData.title,
      currentPrice: isNaN(currentPrice) ? 0 : currentPrice,
      imageUrl: productData.imageUrl,
      platform
    }

  } catch (error) {
    console.error('Error scraping product:', error)
    throw new Error('Failed to scrape product data.')
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
