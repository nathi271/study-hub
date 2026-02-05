import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Star, Filter, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';

interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Video' | 'PDF' | 'Interactive' | 'Quiz';
  description: string;
  rating: number;
  downloads: number;
  image: string;
}

const STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: '1',
    title: 'Algebra Basics - Complete Guide',
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'Easy',
    type: 'PDF',
    description: 'Master the fundamentals of algebra with step-by-step examples and practice problems.',
    rating: 4.8,
    downloads: 1250,
    image: 'https://static.wixstatic.com/media/d7b64f_aab6d0f244bd4635bc792c5c0679f594~mv2.png?originWidth=192&originHeight=128'
  },
  {
    id: '2',
    title: 'Photosynthesis Explained',
    subject: 'Biology',
    topic: 'Photosynthesis',
    difficulty: 'Medium',
    type: 'Video',
    description: 'Understand how plants convert sunlight into energy with interactive diagrams.',
    rating: 4.6,
    downloads: 890,
    image: 'https://static.wixstatic.com/media/d7b64f_433087ff45d94dfca0a69e7fd912c7ab~mv2.png?originWidth=192&originHeight=128'
  },
  {
    id: '3',
    title: 'World War II Timeline',
    subject: 'History',
    topic: 'World War II',
    difficulty: 'Medium',
    type: 'Interactive',
    description: 'Interactive timeline with key events, dates, and historical context.',
    rating: 4.7,
    downloads: 756,
    image: 'https://static.wixstatic.com/media/d7b64f_57abeacaeea54ed6aae9b8377c4e1134~mv2.png?originWidth=192&originHeight=128'
  },
  {
    id: '4',
    title: 'Chemistry Reactions Quiz',
    subject: 'Chemistry',
    topic: 'Chemical Reactions',
    difficulty: 'Hard',
    type: 'Quiz',
    description: 'Test your knowledge with 50 challenging questions on chemical reactions.',
    rating: 4.5,
    downloads: 543,
    image: 'https://static.wixstatic.com/media/d7b64f_aa42f4a7b3004eeeb2f6fb2268d31c2e~mv2.png?originWidth=192&originHeight=128'
  },
  {
    id: '5',
    title: 'English Literature - Shakespeare',
    subject: 'English',
    topic: 'Literature',
    difficulty: 'Medium',
    type: 'PDF',
    description: 'Deep dive into Shakespeare\'s works with analysis and study notes.',
    rating: 4.9,
    downloads: 1100,
    image: 'https://static.wixstatic.com/media/d7b64f_8cbe95a61c41401fa2cfaa1acebff6d0~mv2.png?originWidth=192&originHeight=128'
  },
  {
    id: '6',
    title: 'Physics - Motion & Forces',
    subject: 'Physics',
    topic: 'Motion',
    difficulty: 'Hard',
    type: 'Video',
    description: 'Comprehensive video series on Newton\'s laws and motion concepts.',
    rating: 4.7,
    downloads: 920,
    image: 'https://static.wixstatic.com/media/d7b64f_b3be8e21364647259b21852d74622c48~mv2.png?originWidth=192&originHeight=128'
  },
  {
    id: '7',
    title: 'Calculus - Derivatives Basics',
    subject: 'Mathematics',
    topic: 'Calculus',
    difficulty: 'Hard',
    type: 'Interactive',
    description: 'Learn derivatives with interactive visualizations and practice problems.',
    rating: 4.6,
    downloads: 678,
    image: 'https://static.wixstatic.com/media/d7b64f_bc539d777b774c39909c0b7b8da10d38~mv2.png?originWidth=192&originHeight=128'
  },
  {
    id: '8',
    title: 'Geography - World Capitals',
    subject: 'Geography',
    topic: 'World Geography',
    difficulty: 'Easy',
    type: 'Quiz',
    description: 'Fun quiz to learn and memorize world capitals with flags and facts.',
    rating: 4.4,
    downloads: 445,
    image: 'https://static.wixstatic.com/media/d7b64f_b043bd8bbc8b490188fe087363f40125~mv2.png?originWidth=192&originHeight=128'
  }
];

const SUBJECTS = ['All Subjects', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'English', 'History', 'Geography'];
const TYPES = ['All Types', 'Video', 'PDF', 'Interactive', 'Quiz'];

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>(STUDY_MATERIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    let filtered = STUDY_MATERIALS;

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject !== 'All Subjects') {
      filtered = filtered.filter(m => m.subject === selectedSubject);
    }

    if (selectedType !== 'All Types') {
      filtered = filtered.filter(m => m.type === selectedType);
    }

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(m => m.difficulty === selectedDifficulty);
    }

    setMaterials(filtered);
  }, [searchTerm, selectedSubject, selectedType, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return '🎥';
      case 'PDF':
        return '📄';
      case 'Interactive':
        return '🎮';
      case 'Quiz':
        return '❓';
      default:
        return '📚';
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary font-paragraph">
      <Header />

      <main className="w-full">
        {/* Hero Section */}
        <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <span className="font-paragraph text-sm uppercase tracking-widest text-secondary font-semibold">Study Resources</span>
            </div>
            <h1 className="font-heading text-5xl lg:text-6xl text-primary mb-4 leading-tight">
              Study Materials Library
            </h1>
            <p className="text-lg text-secondary max-w-2xl">
              Find the perfect study materials to master any subject! Videos, PDFs, interactive lessons, and quizzes all in one place. 📚✨
            </p>
          </motion.div>
        </section>

        {/* Search & Filters */}
        <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-12">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by title or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 rounded-full border border-primary/20 focus:border-primary"
              />
            </div>

            {/* Filter Buttons */}
            <div className="space-y-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Subject</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(subject => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedSubject === subject
                          ? 'bg-primary text-softbeige'
                          : 'bg-softbeige border border-primary/20 text-primary hover:border-primary/40'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Material Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedType === type
                          ? 'bg-primary text-softbeige'
                          : 'bg-softbeige border border-primary/20 text-primary hover:border-primary/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-3">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Easy', 'Medium', 'Hard'].map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedDifficulty === difficulty
                          ? 'bg-primary text-softbeige'
                          : 'bg-softbeige border border-primary/20 text-primary hover:border-primary/40'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Materials Grid */}
        <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-20">
          {materials.length === 0 ? (
            <div className="text-center py-20">
              <Lightbulb className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h2 className="font-heading text-2xl text-primary mb-2">No materials found</h2>
              <p className="text-secondary">Try adjusting your filters to find what you're looking for!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material, idx) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full bg-softbeige border border-primary/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg flex flex-col">
                    {/* Image */}
                    <div className="relative h-40 bg-primary/10 overflow-hidden">
                      <Image src={material.image} alt={material.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-white rounded-full p-2 text-2xl">
                        {getTypeIcon(material.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getDifficultyColor(material.difficulty)}`}>
                          {material.difficulty}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-primary">{material.rating}</span>
                        </div>
                      </div>

                      <h3 className="font-heading text-lg text-primary mb-2 line-clamp-2">{material.title}</h3>
                      <p className="text-sm text-secondary mb-3 line-clamp-2">{material.description}</p>

                      <div className="flex items-center gap-4 text-xs text-secondary mb-4 mt-auto">
                        <span>📚 {material.subject}</span>
                        <span>⬇️ {material.downloads}</span>
                      </div>

                      <Button className="w-full bg-primary text-softbeige hover:bg-primary/90 rounded-lg">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-deepgreen text-softbeige rounded-3xl p-12 text-center"
          >
            <h2 className="font-heading text-4xl mb-4">Need Personalized Advice?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-softbeige/90">
              Get tailored recommendations based on your performance and weak subjects!
            </p>
            <Link to="/advice">
              <Button className="bg-softbeige text-primary hover:bg-softbeige/90 rounded-full px-8 py-6 text-lg">
                💡 Get Personalized Advice
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
