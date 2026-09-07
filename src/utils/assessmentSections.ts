import type { LiveAssessmentQuestion, LiveAssessmentSection } from '../types';

export const defaultAssessmentSection = (): LiveAssessmentSection => ({ id: 'section-default', title: '', description: '' });

export const sectionIdFor = (question: LiveAssessmentQuestion, sections: LiveAssessmentSection[]) =>
  sections.some(section => section.id === question.sectionId) ? question.sectionId! : sections[0].id;

export const orderQuestionsBySection = (questions: LiveAssessmentQuestion[], sections: LiveAssessmentSection[]) =>
  sections.flatMap(section => questions.filter(question => sectionIdFor(question, sections) === section.id));
