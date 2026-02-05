/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: studentmarks
 * Interface for StudentMarks
 */
export interface StudentMarks {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  studentId?: string;
  /** @wixFieldType text */
  studentName?: string;
  /** @wixFieldType text */
  subjectName?: string;
  /** @wixFieldType number */
  mark?: number;
  /** @wixFieldType date */
  assessmentDate?: Date | string;
}
