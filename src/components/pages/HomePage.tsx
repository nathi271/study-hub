// HPI 1.7-V
import React, { useState, useRef, useEffect } from 'react';
import { Upload, TrendingUp, Users, AlertTriangle, ArrowDown, BarChart3, GraduationCap, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { StudentMarks } from '@/entities';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';

// --- Types ---
interface SubjectStats {
  subject: string;
  average: number;
  highest: number;
  lowest: number;
  count: number;
}

interface StudentRanking {
  studentId: string;
  studentName: string;
  averageMark: number;
  totalMarks: number;
  subjectCount: number;
}

// --- Components ---

const SectionCounter = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-baseline gap-4 mb-8 border-b border-primary/20 pb-4">
    <span className="font-heading text-2xl text-primary/60">{number}</span>
    <h3 className="font-paragraph text-sm uppercase tracking-widest text-primary font-semibold">{title}</h3>
  </div>
);

const ParallaxImage = ({ src, alt }: { src: string; alt: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <div ref={ref} className="w-full h-full overflow-hidden relative">
      <motion.div style={{ y, scale }} className="w-full h-full">
        {src && alt ? (
          <Image
            src={src}
            alt={alt}
            width={1200}
            className="w-full h-full object-cover"
          />
        ) : null}
      </motion.div>
    </div>
  );
};

export default function HomePage() {
  // --- Canonical Data Sources & Logic (Preserved) ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [studentRankings, setStudentRankings] = useState<StudentRanking[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<StudentRanking[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const AT_RISK_THRESHOLD = 50;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      setIsUploading(true);
      setUploadSuccess(false);

      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        const records: Partial<StudentMarks>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < headers.length) continue;

          const record: Partial<StudentMarks> = {
            _id: crypto.randomUUID(),
            studentId: values[0],
            studentName: values[1],
            subjectName: values[2],
            mark: parseFloat(values[3]),
            assessmentDate: values[4] ? new Date(values[4]).toISOString() : new Date().toISOString()
          };

          records.push(record);
        }

        for (const record of records) {
          await BaseCrudService.create('studentmarks', record);
        }

        setUploadSuccess(true);
        await analyzeData();
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const analyzeData = async () => {
    setIsAnalyzing(true);
    try {
      const result = await BaseCrudService.getAll<StudentMarks>('studentmarks', {}, { limit: 1000 });
      const allMarks = result.items;

      // Calculate subject statistics
      const subjectMap = new Map<string, number[]>();
      allMarks.forEach(mark => {
        if (mark.subjectName && mark.mark !== undefined) {
          if (!subjectMap.has(mark.subjectName)) {
            subjectMap.set(mark.subjectName, []);
          }
          subjectMap.get(mark.subjectName)!.push(mark.mark);
        }
      });

      const stats: SubjectStats[] = Array.from(subjectMap.entries()).map(([subject, marks]) => ({
        subject,
        average: marks.reduce((a, b) => a + b, 0) / marks.length,
        highest: Math.max(...marks),
        lowest: Math.min(...marks),
        count: marks.length
      }));

      setSubjectStats(stats);

      // Calculate student rankings
      const studentMap = new Map<string, { name: string; marks: number[] }>();
      allMarks.forEach(mark => {
        if (mark.studentId && mark.studentName && mark.mark !== undefined) {
          if (!studentMap.has(mark.studentId)) {
            studentMap.set(mark.studentId, { name: mark.studentName, marks: [] });
          }
          studentMap.get(mark.studentId)!.marks.push(mark.mark);
        }
      });

      const rankings: StudentRanking[] = Array.from(studentMap.entries())
        .map(([studentId, data]) => {
          const totalMarks = data.marks.reduce((a, b) => a + b, 0);
          const averageMark = totalMarks / data.marks.length;
          return {
            studentId,
            studentName: data.name,
            averageMark,
            totalMarks,
            subjectCount: data.marks.length
          };
        })
        .sort((a, b) => b.averageMark - a.averageMark);

      setStudentRankings(rankings);

      // Identify at-risk students
      const atRisk = rankings.filter(student => student.averageMark < AT_RISK_THRESHOLD);
      setAtRiskStudents(atRisk);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Scroll Progress for Global Indicator ---
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background text-primary font-paragraph selection:bg-primary selection:text-softbeige overflow-clip">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />
      <Header />

      <main className="w-full">
        {/* --- SECTION 1: HERO (Inspiration Image Replica) --- */}
        <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 pt-32 pb-20 lg:pt-40 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            
            {/* Left: The Green Block with Circular Mask */}
            <div className="lg:col-span-6 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="bg-primary rounded-[3rem] p-12 lg:p-20 relative overflow-hidden"
              >
                {/* Decorative noise texture overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
                
                <div className="aspect-square w-full rounded-full overflow-hidden border-8 border-softbeige/10 relative z-10 shadow-2xl">
                   <ParallaxImage 
                     src="https://static.wixstatic.com/media/d7b64f_f5cc9de9d09e4795823a8b84870adf41~mv2.png?originWidth=1152&originHeight=1152" 
                     alt="Abstract representation of growth and data" 
                   />
                </div>

                {/* Decorative Elements inside the green block */}
                <div className="absolute top-8 right-8 text-softbeige/20">
                  <TrendingUp size={64} strokeWidth={1} />
                </div>
                <div className="absolute bottom-8 left-8 text-softbeige/20 font-heading text-9xl opacity-20 leading-none select-none">
                  A+
                </div>
              </motion.div>
            </div>

            {/* Right: Editorial Typography */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              >
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="font-heading text-3xl text-primary/40">01</span>
                  <span className="h-px w-24 bg-primary/40 self-center"></span>
                  <span className="font-paragraph text-sm uppercase tracking-[0.2em] text-primary/80">Performance Analytics</span>
                </div>

                <h1 className="font-heading text-6xl lg:text-8xl text-primary leading-[0.9] mb-10 tracking-tight">
                  Academic <br/>
                  <span className="italic font-light ml-4">Insight</span> <br/>
                  Engine
                </h1>

                <p className="font-paragraph text-lg lg:text-xl text-secondary max-w-md leading-relaxed mb-12">
                  Transform raw assessment data into actionable intelligence. 
                  Identify trends, support at-risk students, and elevate educational standards through precision analytics.
                </p>

                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-primary text-softbeige hover:bg-primary/90 rounded-full px-10 py-8 text-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    Begin Analysis <ArrowDown className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: METHODOLOGY (Static Content) --- */}
        <section className="w-full bg-primary text-softbeige py-24 lg:py-32 relative overflow-hidden">
           {/* Background Texture */}
           <div className="absolute inset-0 opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
           
           <div className="max-w-[120rem] mx-auto px-4 sm:px-8 relative z-10">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
               <div className="lg:col-span-4">
                 <SectionCounter number="02" title="The Methodology" />
                 <h2 className="font-heading text-5xl lg:text-6xl mb-8 leading-tight">
                   Precision in <br/> Every Point
                 </h2>
                 <p className="text-softbeige/70 text-lg leading-relaxed max-w-sm">
                   Our system employs advanced statistical models to break down complex academic data into clear, navigable insights.
                 </p>
               </div>

               <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { icon: FileText, title: "Data Ingestion", desc: "Securely parse CSV records with instant validation of student IDs and subject metrics." },
                   { icon: BarChart3, title: "Statistical Core", desc: "Compute averages, deviations, and rankings across the entire student cohort instantly." },
                   { icon: GraduationCap, title: "Strategic Action", desc: "Automatically flag performance anomalies and identify students requiring intervention." }
                 ].map((item, idx) => (
                   <motion.div 
                     key={idx}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: idx * 0.2, duration: 0.8 }}
                     className="border-l border-softbeige/20 pl-8 py-4 hover:bg-softbeige/5 transition-colors duration-500"
                   >
                     <item.icon className="w-10 h-10 mb-6 text-softbeige/80" strokeWidth={1} />
                     <h3 className="font-heading text-2xl mb-4">{item.title}</h3>
                     <p className="text-softbeige/60 leading-relaxed">{item.desc}</p>
                   </motion.div>
                 ))}
               </div>
             </div>
           </div>
        </section>

        {/* --- SECTION 3: UPLOAD INTERFACE --- */}
        <section id="upload-section" className="w-full max-w-[100rem] mx-auto px-4 sm:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4 sticky top-32">
              <SectionCounter number="03" title="Data Input" />
              <h2 className="font-heading text-5xl text-primary mb-6">Upload Cohort Data</h2>
              <p className="text-secondary text-lg mb-8">
                Please ensure your CSV file follows the standard schema: Student ID, Name, Subject, Mark, Date.
              </p>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-4 p-4 bg-softbeige rounded-xl border border-primary/10">
                <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : uploadSuccess ? 'bg-green-500' : 'bg-primary/20'}`}></div>
                <span className="font-medium text-primary">
                  {isAnalyzing ? 'Processing Analytics...' : uploadSuccess ? 'Analysis Complete' : 'Ready for Input'}
                </span>
              </div>
            </div>

            <div className="lg:col-span-8">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative group cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload-trigger"
                />
                <label htmlFor="csv-upload-trigger" className="block w-full cursor-pointer">
                  <Card className="w-full aspect-[16/9] lg:aspect-[21/9] border-2 border-dashed border-primary/20 bg-transparent hover:bg-primary/5 transition-all duration-500 rounded-[2rem] flex flex-col items-center justify-center gap-6 group-hover:border-primary/40">
                    <div className="w-20 h-20 rounded-full bg-primary text-softbeige flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      {isUploading ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Users className="w-8 h-8" />
                        </motion.div>
                      ) : (
                        <Upload className="w-8 h-8" />
                      )}
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-heading text-3xl text-primary">
                        {isUploading ? 'Ingesting Data...' : 'Drop CSV File Here'}
                      </h3>
                      <p className="text-secondary font-paragraph">or click to browse your local directory</p>
                    </div>
                  </Card>
                </label>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: ANALYSIS DASHBOARD (Conditional) --- */}
        <AnimatePresence>
          {subjectStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full bg-softbeige border-t border-primary/10"
            >
              {/* 4.1 Subject Statistics */}
              <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 py-32">
                <SectionCounter number="04" title="Subject Performance" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subjectStats.map((stat, index) => (
                    <motion.div
                      key={stat.subject}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full p-8 bg-background border border-primary/10 hover:border-primary/30 transition-colors duration-300 rounded-2xl flex flex-col justify-between group">
                        <div>
                          <h3 className="font-heading text-2xl text-primary mb-6 group-hover:translate-x-2 transition-transform duration-300">{stat.subject}</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-primary/5 pb-2">
                              <span className="text-secondary text-sm uppercase tracking-wider">Avg</span>
                              <span className="font-heading text-3xl text-primary">{stat.average.toFixed(1)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div>
                                <span className="text-secondary text-xs uppercase block mb-1">High</span>
                                <span className="font-medium text-primary">{stat.highest}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-secondary text-xs uppercase block mb-1">Low</span>
                                <span className="font-medium text-primary">{stat.lowest}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-primary/5 flex justify-between items-center">
                          <span className="text-xs text-secondary uppercase tracking-widest">Assessments</span>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{stat.count}</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* 4.2 Student Rankings & At Risk Split */}
              <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-8 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  
                  {/* Rankings Table */}
                  <div className="lg:col-span-8">
                    <SectionCounter number="05" title="Cohort Rankings" />
                    <div className="bg-background rounded-3xl border border-primary/10 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-primary/5 border-b border-primary/10">
                            <tr>
                              <th className="p-6 font-heading text-primary font-normal">Rank</th>
                              <th className="p-6 font-heading text-primary font-normal">Student</th>
                              <th className="p-6 font-heading text-primary font-normal text-right">Subjects</th>
                              <th className="p-6 font-heading text-primary font-normal text-right">Average</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-primary/5">
                            {studentRankings.slice(0, 10).map((student, idx) => (
                              <tr key={student.studentId} className="hover:bg-primary/5 transition-colors">
                                <td className="p-6 font-medium text-primary/60">#{idx + 1}</td>
                                <td className="p-6">
                                  <div className="font-medium text-primary">{student.studentName}</div>
                                  <div className="text-xs text-secondary uppercase tracking-wider">{student.studentId}</div>
                                </td>
                                <td className="p-6 text-right text-secondary">{student.subjectCount}</td>
                                <td className="p-6 text-right">
                                  <span className="font-heading text-xl text-primary">{student.averageMark.toFixed(1)}%</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {studentRankings.length > 10 && (
                          <div className="p-4 text-center border-t border-primary/10 text-secondary text-sm">
                            And {studentRankings.length - 10} more students...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* At Risk Sidebar */}
                  <div className="lg:col-span-4">
                    <div className="sticky top-32">
                      <div className="flex items-center gap-3 mb-8 border-b border-destructive/20 pb-4">
                        <AlertTriangle className="text-destructive w-6 h-6" />
                        <h3 className="font-paragraph text-sm uppercase tracking-widest text-destructive font-bold">Intervention Required</h3>
                      </div>
                      
                      {atRiskStudents.length === 0 ? (
                        <div className="p-8 bg-primary/5 rounded-2xl text-center border border-primary/10">
                          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                          <h4 className="font-heading text-xl text-primary mb-2">All Clear</h4>
                          <p className="text-secondary">No students are currently below the {AT_RISK_THRESHOLD}% threshold.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {atRiskStudents.map((student) => (
                            <motion.div
                              key={student.studentId}
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                            >
                              <Card className="p-6 border-l-4 border-l-destructive border-y border-r border-primary/10 bg-background shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-heading text-lg text-primary">{student.studentName}</h4>
                                    <span className="text-xs text-secondary uppercase">{student.studentId}</span>
                                  </div>
                                  <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded">
                                    CRITICAL
                                  </span>
                                </div>
                                <div className="flex justify-between items-end">
                                  <span className="text-sm text-secondary">Current Average</span>
                                  <span className="font-heading text-2xl text-destructive">{student.averageMark.toFixed(1)}%</span>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}