import puppeteer from 'puppeteer'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

interface OGImageConfig {
  title: string
  subtitle: string
  description: string
  category: string
  categoryColor: string
  filename: string
}

// Main section pages
const mainPages: OGImageConfig[] = []

// DSA algorithm pages
const dsaPages: OGImageConfig[] = []

// ML algorithm pages
const mlPages: OGImageConfig[] = []

// Combine all configs
const allConfigs = [...mainPages, ...dsaPages, ...mlPages]

async function generateOGImage(config: OGImageConfig) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  // Set viewport to OG image dimensions (2x for retina)
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2,
  })

  // Create HTML content with minimalist professional design
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          body {
            width: 1200px;
            height: 630px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #0a0a0a;
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: white;
            position: relative;
            overflow: hidden;
            padding: 80px 100px;
          }
          
          /* Subtle diagonal pattern like homepage */
          .pattern {
            position: absolute;
            inset: 0;
            background-image: repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.02) 10px,
              rgba(255, 255, 255, 0.02) 24px
            );
            background-size: 24px 24px;
            z-index: 0;
          }

          .container {
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: 32px;
            max-width: 1000px;
          }

          .header {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .logo {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 2px;
            color: rgba(255, 255, 255, 0.5);
            text-transform: uppercase;
          }

          .separator {
            width: 1px;
            height: 20px;
            background: rgba(255, 255, 255, 0.15);
          }

          .category {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 20px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.7);
          }

          .category-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${config.categoryColor};
            box-shadow: 0 0 12px ${config.categoryColor}80;
          }

          .content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .title {
            font-size: ${config.title.length > 35 ? '68px' : config.title.length > 25 ? '84px' : '100px'};
            font-weight: 900;
            line-height: 0.95;
            letter-spacing: -3px;
            color: white;
            margin: 0;
          }

          .subtitle {
            font-size: 32px;
            font-weight: 500;
            line-height: 1.3;
            color: rgba(255, 255, 255, 0.65);
            letter-spacing: -0.5px;
            max-width: 900px;
            margin-bottom: 16px;
          }

          .description {
            font-size: 20px;
            font-weight: 400;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.45);
            max-width: 800px;
            letter-spacing: 0px;
          }

          .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30px 100px;
            background: linear-gradient(to top, rgba(10, 10, 10, 0.95), transparent);
          }

          .domain {
            font-size: 18px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.4);
            letter-spacing: 0.5px;
          }

          .tagline {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.35);
            font-weight: 500;
          }

          /* Accent bar */
          .accent {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: ${config.categoryColor};
            z-index: 2;
          }

          /* Subtle glow effect */
          .glow {
            position: absolute;
            top: -200px;
            right: -200px;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, ${config.categoryColor}15 0%, transparent 70%);
            z-index: 0;
          }
        </style>
      </head>
      <body>
        <div class="pattern"></div>
        <div class="accent"></div>
        <div class="glow"></div>
        
        <div class="container">
          <div class="header">
            <div class="logo">LEARN ALGO</div>
            <div class="separator"></div>
            <div class="category">
              <div class="category-dot"></div>
              ${config.category}
            </div>
          </div>
          
          <div class="content">
            <h1 class="title">${config.title}</h1>
            <p class="subtitle">${config.subtitle}</p>
            <p class="description">${config.description}</p>
          </div>
        </div>
        
        <div class="footer">
          <div class="domain">learn-algo.com</div>
          <div class="tagline">Interactive Algorithm Visualization</div>
        </div>
      </body>
    </html>
  `

  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 })

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready)

  // Take screenshot
  const screenshot = await page.screenshot({
    type: 'png',
    encoding: 'binary',
  })

  // Save to public/og folder
  const outputDir = join(process.cwd(), 'public', 'og')
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, config.filename), screenshot)

  console.log(`✅ Generated: ${config.filename}`)

  await browser.close()
}

async function generateAllImages() {
  console.log('🎨 Starting OG Image Generation (Minimalist Design)...\n')
  console.log(`📊 Total images to generate: ${allConfigs.length}\n`)

  const startTime = Date.now()
  let successCount = 0
  let failCount = 0

  // Generate images sequentially to avoid memory issues
  for (let i = 0; i < allConfigs.length; i++) {
    const config = allConfigs[i]
    console.log(`[${i + 1}/${allConfigs.length}] Generating: ${config.filename}`)

    try {
      await generateOGImage(config)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to generate ${config.filename}:`, error)
      failCount++
    }
  }

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  console.log(`\n✨ Image generation complete!`)
  console.log(`⏱️  Total time: ${duration}s`)
  console.log(`✅ Successful: ${successCount}/${allConfigs.length}`)
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`)
  }
  console.log(`📁 Output directory: /public/`)
  console.log(`\n🔍 Generated images:`)
  console.log(`   - ${mainPages.length} main section pages`)
  console.log(`   - ${dsaPages.length} DSA algorithm pages`)
  console.log(`   - ${mlPages.length} ML algorithm pages`)

  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0)
}

// Run the generator
generateAllImages().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
