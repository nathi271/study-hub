import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2, BookOpen, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { StudentMarks } from '@/entities';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface AdviceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips: string[];
  color: string;
}

interface StudentAdvice {
  studentId: string;
  studentName: string;
  overallAverage: number;
  weakSubjects: string[];
  strongSubjects: string[];
  advice: AdviceItem[];
}

export default function AdvicePage() {
  const [studentAdvice, setStudentAdvice] = useState<StudentAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [allStudents, setAllStudents] = useState<string[]>([]);

  useEffect(() => {
    loadStudentAdvice();
  }, []);

  const generateAdvice = (
    overallAverage: number,
    weakSubjects: string[],
    strongSubjects: string[]
  ): AdviceItem[] => {
    const advice: AdviceItem[] = [];

    // Overall Performance Advice
    if (overallAverage >= 80) {
      advice.push({
        icon: <Zap className="w-6 h-6" />,
        title: '🌟 Excellent Performance!',
        description: 'You\'re doing amazing! Keep up this momentum and challenge yourself with advanced topics.',
        tips: [
          'Try advanced problem-solving exercises',
          'Help your classmates - teaching reinforces learning',
          'Explore topics beyond the curriculum',
          'Participate in academic competitions'
        ],
        color: 'from-green-400 to-emerald-600'
      });
    } else if (overallAverage >= 60) {
      advice.push({
        icon: <TrendingUp className="w-6 h-6" />,
        title: '💪 Good Progress!',
        description: 'You\'re on the right track! Focus on consistency and practice to improve further.',
        tips: [
          'Create a regular study schedule',
          'Review weak topics weekly',
          'Practice with past papers',
          'Join study groups with peers'
        ],
        color: 'from-blue-400 to-blue-600'
      });
    } else {
      advice.push({
        icon: <AlertCircle className="w-6 h-6" />,
        title: '🎯 Time to Focus!',
        description: 'You need to put in more effort. Let\'s create a plan to improve your grades!',
        tips: [
          'Study for 30 minutes daily without distractions',
          'Focus on fundamentals first',
          'Ask your teacher for help',
          'Use active learning techniques'
        ],
        color: 'from-orange-400 to-red-600'
      });
    }

    // Weak Subjects Advice
    if (weakSubjects.length > 0) {
      advice.push({
        icon: <Target className="w-6 h-6" />,
        title: `📚 Improve ${weakSubjects[0]}`,
        description: `${weakSubjects[0]} needs your attention. Here's how to turn it around!`,
        tips: [
          `Dedicate extra time to ${weakSubjects[0]} each week`,
          'Break complex topics into smaller parts',
          'Use visual aids and diagrams',
          'Practice problems daily',
          'Watch tutorial videos for difficult concepts'
        ],
        color: 'from-red-400 to-pink-600'
      });
    }

    // Strong Subjects Advice
    if (strongSubjects.length > 0) {
      advice.push({
        icon: <CheckCircle2 className="w-6 h-6" />,
        title: `🏆 Master ${strongSubjects[0]}`,
        description: `You're crushing ${strongSubjects[0]}! Keep building on this strength!`,
        tips: [
          `Continue excelling in ${strongSubjects[0]}`,
          'Help others understand this subject',
          'Explore advanced topics',
          'Apply concepts to real-world problems',
          'Consider this for future studies'
        ],
        color: 'from-green-400 to-teal-600'
      });
    }

    // General Study Tips
    advice.push({
      icon: <Lightbulb className="w-6 h-6" />,
      title: '💡 Universal Study Tips',
      description: 'These strategies work for any subject!',
      tips: [
        'Study in a quiet, organized environment',
        'Take breaks every 25-30 minutes (Pomodoro technique)',
        'Sleep well - it helps memory consolidation',
        'Eat healthy snacks while studying',
        'Review notes within 24 hours of learning'
      ],
      color: 'from-yellow-400 to-orange-600'
    });

    return advice;
  };

  const loadStudentAdvice = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<StudentMarks>('studentmarks', {}, { limit: 1000 });
      const allMarks = result.items;

      // Get unique students
      const uniqueStudents = Array.from(new Set(allMarks.map(m => m.studentId).filter(Boolean))) as string[];
      setAllStudents(uniqueStudents);

      // Use first student or selected student
      const studentIdToUse = selectedStudentId || uniqueStudents[0];
      if (!studentIdToUse) {
        setIsLoading(false);
        return;
      }

      // Filter marks for this student
      const studentMarks = allMarks.filter(m => m.studentId === studentIdToUse);
      const studentName = studentMarks[0]?.studentName || 'Student';

      // Calculate subject performance
      const subjectMap = new Map<string, number[]>();
      studentMarks.forEach(mark => {
        if (mark.subjectName && mark.mark !== undefined) {
          if (!subjectMap.has(mark.subjectName)) {
            subjectMap.set(mark.subjectName, []);
          }
          subjectMap.get(mark.subjectName)!.push(mark.mark);
        }
      });

      const subjects = Array.from(subjectMap.entries()).map(([subject, marks]) => ({
        subject,
        average: marks.reduce((a, b) => a + b, 0) / marks.length
      }));

      const overallAverage = subjects.reduce((sum, s) => sum + s.average, 0) / subjects.length;
      const weakSubjects = subjects.filter(s => s.average < 60).map(s => s.subject);
      const strongSubjects = subjects.filter(s => s.average >= 80).map(s => s.subject);

      const advice = generateAdvice(overallAverage, weakSubjects, strongSubjects);

      setStudentAdvice({
        studentId: studentIdToUse,
        studentName,
        overallAverage,
        weakSubjects,
        strongSubjects,
        advice
      });
    } catch (error) {
      console.error('Failed to load student advice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsLoading(true);
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentAdvice();
    }
  }, [selectedStudentId]);

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
              <Lightbulb className="w-8 h-8 text-primary" />
              <span className="font-paragraph text-sm uppercase tracking-widest text-secondary font-semibold">Smart Guidance</span>
            </div>
            <h1 className="font-heading text-5xl lg:text-6xl text-primary mb-4 leading-tight">
              Personalized Study Advice
            </h1>
            <p className="text-lg text-secondary max-w-2xl">
              Get tailored recommendations based on your performance! We analyze your marks and give you specific tips to improve. 🚀
            </p>
          </motion.div>
        </section>

        {/* Student Selector */}
        {allStudents.length > 0 && (
          <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-8">
            <div className="flex flex-wrap gap-3">
              {allStudents.map(studentId => (
                <button
                  key={studentId}
                  onClick={() => handleStudentChange(studentId)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedStudentId === studentId || (!selectedStudentId && studentId === allStudents[0])
                      ? 'bg-primary text-softbeige'
                      : 'bg-softbeige border border-primary/20 text-primary hover:border-primary/40'
                  }`}
                >
                  {studentId}
                </button>
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 py-20 text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-primary/10 rounded-lg mb-4 w-1/3 mx-auto"></div>
              <div className="h-6 bg-primary/10 rounded-lg w-1/2 mx-auto"></div>
            </div>
          </section>
        ) : !studentAdvice ? (
          <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 py-20 text-center">
            <AlertCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h2 className="font-heading text-2xl text-primary mb-2">No Data Yet</h2>
            <p className="text-secondary">Upload your marks to get personalized advice!</p>
          </section>
        ) : (
          <>
            {/* Student Info */}
            <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-primary to-deepgreen text-softbeige rounded-3xl p-8"
              >
                <h2 className="font-heading text-3xl mb-2">Hi, {studentAdvice.studentName}! 👋</h2>
                <p className="text-lg text-softbeige/90">
                  Your overall average is <span className="font-heading text-4xl">{studentAdvice.overallAverage.toFixed(1)}%</span>
                </p>
              </motion.div>
            </section>

            {/* Advice Cards */}
            <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-20">
              <div className="space-y-6">
                {studentAdvice.advice.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-softbeige border border-primary/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                      <div className={`bg-gradient-to-r ${item.color} p-8 text-white`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="bg-white/20 p-3 rounded-lg">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="font-heading text-2xl mb-2">{item.title}</h3>
                            <p className="text-white/90">{item.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-8">
                        <h4 className="font-heading text-lg text-primary mb-4">💡 Tips to Remember:</h4>
                        <ul className="space-y-3">
                          {item.tips.map((tip, tipIdx) => (
                            <li key={tipIdx} className="flex items-start gap-3">
                              <span className="text-primary font-bold mt-1">✓</span>
                              <span className="text-secondary">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Action Section */}
            <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-8 bg-gradient-to-br from-softbeige to-background border border-primary/10 rounded-2xl h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading text-2xl text-primary mb-3">📚 Need Study Materials?</h3>
                      <p className="text-secondary mb-6">
                        Find resources tailored to your weak subjects and learning style.
                      </p>
                    </div>
                    <Link to="/study-materials">
                      <Button className="w-full bg-primary text-softbeige hover:bg-primary/90 rounded-lg">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Browse Study Materials
                      </Button>
                    </Link>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-8 bg-gradient-to-br from-primary to-deepgreen text-softbeige rounded-2xl h-full flex flex-col justify-between border-0">
                    <div>
                      <h3 className="font-heading text-2xl mb-3">📊 Check Your Progress</h3>
                      <p className="text-softbeige/90 mb-6">
                        View your detailed dashboard and track improvements over time.
                      </p>
                    </div>
                    <Link to="/dashboard">
                      <Button className="w-full bg-softbeige text-primary hover:bg-softbeige/90 rounded-lg">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              </div>
            </section>

            {/* Motivational Section */}
            <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white rounded-3xl p-12 text-center"
              >
                <h2 className="font-heading text-4xl mb-4">🌟 Remember!</h2>
                <p className="text-lg mb-6 max-w-2xl mx-auto">
                  Every expert was once a beginner. Your effort today determines your success tomorrow. Keep pushing, stay consistent, and believe in yourself! 💪
                </p>
                <p className="text-white/90 italic">
                  "Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill
                </p>
              </motion.div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
