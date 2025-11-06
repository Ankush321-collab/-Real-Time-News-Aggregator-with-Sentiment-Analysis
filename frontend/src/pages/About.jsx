import { motion } from 'framer-motion'
import { Heart, Github, Linkedin, Mail, Sparkles } from 'lucide-react'
import { ANIMATION_VARIANTS } from '../utils/constants'

const About = () => {
  const techStack = [
    {
      category: 'Frontend',
      technologies: [
        { name: 'React.js', color: 'text-blue-400' },
        { name: 'Tailwind CSS', color: 'text-cyan-400' },
        { name: 'Framer Motion', color: 'text-purple-400' },
        { name: 'Recharts', color: 'text-green-400' },
      ],
    },
    {
      category: 'Backend',
      technologies: [
        { name: 'Node.js', color: 'text-green-500' },
        { name: 'Express.js', color: 'text-gray-400' },
        { name: 'MongoDB', color: 'text-green-600' },
        { name: 'Mongoose', color: 'text-red-400' },
      ],
    },
    {
      category: 'Scraping & AI',
      technologies: [
        { name: 'Python', color: 'text-yellow-400' },
        { name: 'Selenium', color: 'text-green-400' },
        { name: 'BeautifulSoup', color: 'text-orange-400' },
        { name: 'NLTK VADER', color: 'text-purple-400' },
      ],
    },
  ]

  const features = [
    {
      title: 'Real-Time Scraping',
      description:
        'Automated news aggregation from multiple sources using Python Selenium',
      icon: '🕷️',
    },
    {
      title: 'AI Sentiment Analysis',
      description:
        'NLTK VADER-powered sentiment scoring for every article',
      icon: '🧠',
    },
    {
      title: 'Interactive Charts',
      description:
        'Beautiful visualizations showing sentiment trends and distributions',
      icon: '📊',
    },
    {
      title: 'Modern UI/UX',
      description:
        'Glassmorphic design with smooth animations and responsive layout',
      icon: '✨',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="inline-block mb-6"
        >
          <Sparkles className="w-16 h-16 text-blue-400" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">
          AI-Powered ScrapeSense
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Real-Time News Aggregator with Sentiment Analysis and Interactive
          Insights
        </p>
      </motion.div>

      {/* Project Description */}
      <motion.div
        variants={ANIMATION_VARIANTS.slideUp}
        initial="hidden"
        animate="visible"
        className="card-gradient rounded-xl p-8 border border-white/10"
      >
        <h2 className="text-2xl font-bold text-white mb-4">About the Project</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          ScrapeSense is an AI-powered news aggregation platform that collects,
          analyzes, and visualizes news articles from multiple sources in
          real-time. Using advanced web scraping techniques and natural language
          processing, it provides instant sentiment analysis and interactive
          insights to help you understand the emotional tone of current events.
        </p>
        <p className="text-gray-300 leading-relaxed">
          The platform combines modern web technologies with powerful AI
          algorithms to deliver a seamless user experience, making it easy to
          stay informed about global news trends and sentiment patterns.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div>
        <motion.h2
          variants={ANIMATION_VARIANTS.fadeIn}
          initial="hidden"
          animate="visible"
          className="text-2xl font-bold text-white mb-6 text-center"
        >
          Key Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={ANIMATION_VARIANTS.slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="card-gradient rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <motion.h2
          variants={ANIMATION_VARIANTS.fadeIn}
          initial="hidden"
          animate="visible"
          className="text-2xl font-bold text-white mb-6 text-center"
        >
          Tech Stack
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {techStack.map((category, index) => (
            <motion.div
              key={category.category}
              variants={ANIMATION_VARIANTS.slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className="card-gradient rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.technologies.map((tech) => (
                  <motion.div
                    key={tech.name}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className={`font-medium ${tech.color}`}>
                      {tech.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="hidden"
        animate="visible"
        className="card-gradient rounded-xl p-8 border border-white/10 text-center"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-gray-300">Made with</span>
          <Heart className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-gray-300">by</span>
          <span className="text-blue-400 font-semibold">Your Team</span>
        </div>

        <div className="flex items-center justify-center space-x-6 mt-6">
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 360 }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Github className="w-6 h-6 text-gray-300" />
          </motion.a>
          <motion.a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 360 }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Linkedin className="w-6 h-6 text-blue-400" />
          </motion.a>
          <motion.a
            href="mailto:contact@example.com"
            whileHover={{ scale: 1.2, rotate: 360 }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Mail className="w-6 h-6 text-purple-400" />
          </motion.a>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          © 2025 ScrapeSense. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}

export default About
