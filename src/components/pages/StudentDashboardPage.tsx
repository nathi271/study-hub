import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, AlertCircle, Zap, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { StudentMarks } from '@/entities';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SubjectPerformance {
  subject: string;
  average: number;
  latestMark: number;
  trend: 'up' | 'down' | 'stable';
  assessmentCount: number;
}

interface StudentData {
  studentId: string;
  studentName: string;
  overallAverage: number;
  subjects: SubjectPerformance[];
  weakestSubject: string;
  strongestSubject: string;
}

export default function StudentDashboardPage() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [allStudents, setAllStudents] = useState<string[]>([]);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
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

      const subjects: SubjectPerformance[] = Array.from(subjectMap.entries()).map(([subject, marks]) => {
        const average = marks.reduce((a, b) => a + b, 0) / marks.length;
        const latestMark = marks[marks.length - 1];
        const previousAverage = marks.length > 1 ? marks.slice(0, -1).reduce((a, b) => a + b, 0) / (marks.length - 1) : average;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (latestMark > previousAverage + 2) trend = 'up';
        else if (latestMark < previousAverage - 2) trend = 'down';

        return {
          subject,
          average,
          latestMark,
          trend,
          assessmentCount: marks.length
        };
      });

      const overallAverage = subjects.reduce((sum, s) => sum + s.average, 0) / subjects.length;
      const weakestSubject = subjects.reduce((min, s) => s.average < min.average ? s : min).subject;
      const strongestSubject = subjects.reduce((max, s) => s.average > max.average ? s : max).subject;

      setStudentData({
        studentId: studentIdToUse,
        studentName,
        overallAverage,
        subjects: subjects.sort((a, b) => a.average - b.average),
        weakestSubject,
        strongestSubject
      });
    } catch (error) {
      console.error('Failed to load student data:', error);
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
      loadStudentData();
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
              <Zap className="w-8 h-8 text-primary" />
              <span className="font-paragraph text-sm uppercase tracking-widest text-secondary font-semibold">Your Learning Hub</span>
            </div>
            <h1 className="font-heading text-5xl lg:text-6xl text-primary mb-4 leading-tight">
              Your Academic Dashboard
            </h1>
            <p className="text-lg text-secondary max-w-2xl">
              Track your progress, identify areas to improve, and get personalized study recommendations to ace your subjects! 🎯
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
        ) : !studentData ? (
          <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 py-20 text-center">
            <AlertCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h2 className="font-heading text-2xl text-primary mb-2">No Data Yet</h2>
            <p className="text-secondary">Upload your marks to see your dashboard!</p>
          </section>
        ) : (
          <>
            {/* Overall Stats */}
            <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-8 bg-gradient-to-br from-primary to-deepgreen text-softbeige rounded-2xl border-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-lg">Overall Average</h3>
                      <Award className="w-6 h-6" />
                    </div>
                    <p className="font-heading text-5xl mb-2">{studentData.overallAverage.toFixed(1)}%</p>
                    <p className="text-softbeige/80 text-sm">Keep pushing! You're doing great! 💪</p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-8 bg-gradient-to-br from-mutedgreen to-primary text-softbeige rounded-2xl border-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-lg">Strongest Subject</h3>
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="font-heading text-3xl mb-2">{studentData.strongestSubject}</p>
                    <p className="text-softbeige/80 text-sm">You're crushing it here! 🌟</p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-8 bg-gradient-to-br from-destructive/80 to-destructive text-softbeige rounded-2xl border-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-lg">Needs Work</h3>
                      <Target className="w-6 h-6" />
                    </div>
                    <p className="font-heading text-3xl mb-2">{studentData.weakestSubject}</p>
                    <p className="text-softbeige/80 text-sm">Let's improve this together! 📚</p>
                  </Card>
                </motion.div>
              </div>
            </section>

            {/* Subject Breakdown */}
            <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-12">
              <div className="mb-8">
                <h2 className="font-heading text-3xl text-primary mb-2">Your Subjects</h2>
                <p className="text-secondary">Here's how you're doing in each subject</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentData.subjects.map((subject, idx) => (
                  <motion.div
                    key={subject.subject}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="p-6 bg-softbeige border border-primary/10 rounded-2xl hover:border-primary/30 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-heading text-2xl text-primary">{subject.subject}</h3>
                          <p className="text-xs text-secondary uppercase tracking-wider mt-1">
                            {subject.assessmentCount} assessment{subject.assessmentCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {subject.trend === 'up' && <TrendingUp className="w-6 h-6 text-green-600" />}
                        {subject.trend === 'down' && <AlertCircle className="w-6 h-6 text-destructive" />}
                        {subject.trend === 'stable' && <Zap className="w-6 h-6 text-primary" />}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-secondary">Average</span>
                            <span className="font-heading text-lg text-primary">{subject.average.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-primary/10 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${subject.average}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                          <span className="text-sm text-secondary">Latest Mark</span>
                          <span className="font-heading text-xl text-primary">{subject.latestMark}%</span>
                        </div>
                      </div>

                      <Link
                        to={`/study-materials?subject=${encodeURIComponent(subject.subject)}`}
                        className="mt-4 block"
                      >
                        <Button className="w-full bg-primary text-softbeige hover:bg-primary/90 rounded-lg">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Study Materials
                        </Button>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-primary to-deepgreen text-softbeige rounded-3xl p-12 text-center"
              >
                <h2 className="font-heading text-4xl mb-4">Ready to Improve?</h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto text-softbeige/90">
                  Check out personalized study materials and get advice tailored to your performance!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/study-materials">
                    <Button className="bg-softbeige text-primary hover:bg-softbeige/90 rounded-full px-8 py-6 text-lg">
                      📚 Study Materials
                    </Button>
                  </Link>
                  <Link to="/advice">
                    <Button className="bg-primary/20 text-softbeige hover:bg-primary/30 rounded-full px-8 py-6 text-lg border border-softbeige/30">
                      💡 Get Advice
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
