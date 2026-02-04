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
const mainPages: OGImageConfig[] = [
  {
    title: 'LEARN ALGO',
    subtitle: 'See Algorithms in Motion',
    description: 'Interactive visualizations for DSA, ML & AI algorithms',
    category: 'DSA • ML • AI',
    categoryColor: '#9333EA',
    filename: 'og-image.png',
  },
  {
    title: 'Data Structures & Algorithms',
    subtitle: 'Master DSA Through Practice',
    description: 'Sorting, searching, trees, graphs & more',
    category: 'DSA',
    categoryColor: '#9333EA',
    filename: 'og-dsa.png',
  },
  {
    title: 'Machine Learning',
    subtitle: 'Interactive ML Visualizations',
    description: 'Regression, classification, clustering & preprocessing',
    category: 'ML',
    categoryColor: '#10B981',
    filename: 'og-ml.png',
  },
  {
    title: 'AI Algorithms',
    subtitle: 'Explore Artificial Intelligence',
    description: 'Neural networks, deep learning & AI concepts',
    category: 'AI',
    categoryColor: '#3B82F6',
    filename: 'og-ai.png',
  },
]

// DSA algorithm pages
const dsaPages: OGImageConfig[] = [
  {
    title: 'Bubble Sort',
    subtitle: 'Simple Comparison-Based Sorting',
    description: 'Watch adjacent elements swap to sort arrays step by step',
    category: 'DSA • Sorting',
    categoryColor: '#9333EA',
    filename: 'og-dsa-bubble-sort.png',
  },
  {
    title: 'Selection Sort',
    subtitle: 'In-Place Sorting Algorithm',
    description: 'Select minimum element and move it to sorted position',
    category: 'DSA • Sorting',
    categoryColor: '#9333EA',
    filename: 'og-dsa-selection-sort.png',
  },
  {
    title: 'Insertion Sort',
    subtitle: 'Efficient for Small Data Sets',
    description: 'Build sorted array one element at a time',
    category: 'DSA • Sorting',
    categoryColor: '#9333EA',
    filename: 'og-dsa-insertion-sort.png',
  },
  {
    title: 'Merge Sort',
    subtitle: 'Divide and Conquer Sorting',
    description: 'Split array, sort halves, then merge them back',
    category: 'DSA • Sorting',
    categoryColor: '#9333EA',
    filename: 'og-dsa-merge-sort.png',
  },
  {
    title: 'Quick Sort',
    subtitle: 'Fast Partition-Based Sorting',
    description: 'Partition around pivot and sort recursively',
    category: 'DSA • Sorting',
    categoryColor: '#9333EA',
    filename: 'og-dsa-quick-sort.png',
  },
  {
    title: 'Heap Sort',
    subtitle: 'Heap-Based Sorting Algorithm',
    description: 'Build max heap and extract elements in order',
    category: 'DSA • Sorting',
    categoryColor: '#9333EA',
    filename: 'og-dsa-heap-sort.png',
  },
  {
    title: 'Binary Search Tree',
    subtitle: 'Efficient Data Structure',
    description: 'Fast insertion, deletion and search operations',
    category: 'DSA • Trees',
    categoryColor: '#9333EA',
    filename: 'og-dsa-binary-search-tree.png',
  },
  {
    title: 'Stack',
    subtitle: 'LIFO Data Structure',
    description: 'Last In, First Out: Push and pop operations',
    category: 'DSA • Data Structures',
    categoryColor: '#9333EA',
    filename: 'og-dsa-stack.png',
  },
  {
    title: 'Queue',
    subtitle: 'FIFO Data Structure',
    description: 'First In, First Out: Enqueue and dequeue operations',
    category: 'DSA • Data Structures',
    categoryColor: '#9333EA',
    filename: 'og-dsa-queue.png',
  },
  {
    title: 'Array Operations',
    subtitle: 'Master Array Manipulation',
    description: 'Insert, delete, search, update and traverse arrays',
    category: 'DSA • Arrays',
    categoryColor: '#9333EA',
    filename: 'og-dsa-array-operations.png',
  },
  {
    title: 'String Operations',
    subtitle: 'Text Processing & Manipulation',
    description: 'Reverse, search, pattern matching and transformations',
    category: 'DSA • Strings',
    categoryColor: '#9333EA',
    filename: 'og-dsa-strings.png',
  },
  {
    title: 'Binary Search',
    subtitle: 'Efficient Search Algorithm',
    description: 'Divide and conquer search on sorted arrays',
    category: 'DSA • Searching',
    categoryColor: '#9333EA',
    filename: 'og-dsa-binary-search.png',
  },
  {
    title: 'Bit Manipulation',
    subtitle: 'Binary Operations & Tricks',
    description: 'AND, OR, XOR, shifts and bitwise optimization',
    category: 'DSA • Bitwise',
    categoryColor: '#9333EA',
    filename: 'og-dsa-bit-manipulation.png',
  },
  {
    title: 'Recursion',
    subtitle: 'Function Calling Itself',
    description: 'Base case, recursive case and call stack visualization',
    category: 'DSA • Techniques',
    categoryColor: '#9333EA',
    filename: 'og-dsa-recursion.png',
  },
]

// ML algorithm pages
const mlPages: OGImageConfig[] = [
  {
    title: 'Chance Events',
    subtitle: 'Probability & Randomness',
    description: 'Visualize coin flips and dice rolls to understand probability',
    category: 'ML • Probability',
    categoryColor: '#10B981',
    filename: 'og-ml-chance-events.png',
  },
  {
    title: 'Expected Value',
    subtitle: 'Probability-Weighted Average',
    description: 'Watch running mean converge to E[X] through dice rolling',
    category: 'ML • Probability',
    categoryColor: '#10B981',
    filename: 'og-ml-expectation.png',
  },
  {
    title: 'Variance',
    subtitle: 'Measuring Statistical Spread',
    description: 'Explore how variance quantifies distribution spread',
    category: 'ML • Probability',
    categoryColor: '#10B981',
    filename: 'og-ml-variance.png',
  },
  {
    title: 'Linear Regression',
    subtitle: 'Predicting Continuous Values',
    description: 'Fit a line to data points using gradient descent',
    category: 'ML • Regression',
    categoryColor: '#10B981',
    filename: 'og-ml-linear-regression.png',
  },
  {
    title: 'Polynomial Regression',
    subtitle: 'Non-Linear Curve Fitting',
    description: 'Model complex relationships with polynomial features',
    category: 'ML • Regression',
    categoryColor: '#10B981',
    filename: 'og-ml-polynomial-regression.png',
  },
  {
    title: 'Logistic Regression',
    subtitle: 'Binary Classification',
    description: 'Classify data into two categories using sigmoid',
    category: 'ML • Classification',
    categoryColor: '#10B981',
    filename: 'og-ml-logistic-regression.png',
  },
  {
    title: 'K-Nearest Neighbors',
    subtitle: 'Instance-Based Learning',
    description: 'Classify based on K closest training examples',
    category: 'ML • Classification',
    categoryColor: '#10B981',
    filename: 'og-ml-knn.png',
  },
  {
    title: 'Decision Tree',
    subtitle: 'Classification & Regression',
    description: 'Build tree structure using Gini impurity splits',
    category: 'ML • Classification',
    categoryColor: '#10B981',
    filename: 'og-ml-decision-tree.png',
  },
  {
    title: 'Random Forest',
    subtitle: 'Ensemble Learning',
    description: 'Combine multiple decision trees for robust predictions',
    category: 'ML • Ensemble',
    categoryColor: '#10B981',
    filename: 'og-ml-ensemble-models.png',
  },
  {
    title: 'K-Means Clustering',
    subtitle: 'Unsupervised Learning',
    description: 'Group data points into K distinct clusters',
    category: 'ML • Clustering',
    categoryColor: '#10B981',
    filename: 'og-ml-k-means.png',
  },
  {
    title: 'Gaussian Mixture Model',
    subtitle: 'Probabilistic Clustering with EM Algorithm',
    description: 'Soft clustering using multivariate Gaussians and expectation maximization',
    category: 'ML • Clustering',
    categoryColor: '#10B981',
    filename: 'og-ml-gmm.png',
  },
  {
    title: 'DBSCAN Clustering',
    subtitle: 'Density-Based Spatial Clustering',
    description: 'Discover arbitrary-shaped clusters and detect outliers automatically',
    category: 'ML • Clustering',
    categoryColor: '#10B981',
    filename: 'og-ml-dbscan.png',
  },
  {
    title: 'Hierarchical Clustering',
    subtitle: 'Build Cluster Hierarchies',
    description: 'Agglomerative and divisive clustering with linkage methods',
    category: 'ML • Clustering',
    categoryColor: '#10B981',
    filename: 'og-ml-hierarchical-clustering.png',
  },
  {
    title: 'Anomaly Detection',
    subtitle: 'Identify Outliers & Anomalies',
    description: 'Isolation Forest, One-Class SVM, LOF, and statistical methods',
    category: 'ML • Anomaly Detection',
    categoryColor: '#10B981',
    filename: 'og-ml-anomaly-detection.png',
  },
  {
    title: 'Gradient Descent',
    subtitle: 'Optimization Algorithm',
    description: 'Minimize cost function by iterative descent',
    category: 'ML • Optimization',
    categoryColor: '#10B981',
    filename: 'og-ml-gradient-descent.png',
  },
  {
    title: 'Standard Scaler',
    subtitle: 'Feature Standardization',
    description: 'Scale features to have zero mean and unit variance',
    category: 'ML • Preprocessing',
    categoryColor: '#10B981',
    filename: 'og-ml-standard-scaler.png',
  },
  {
    title: 'MinMax Scaler',
    subtitle: 'Feature Normalization',
    description: 'Scale features to a fixed range [0, 1]',
    category: 'ML • Preprocessing',
    categoryColor: '#10B981',
    filename: 'og-ml-minmax-scaler.png',
  },
]

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
