import { Suspense } from 'react';
import AssessmentQuiz from '@/components/assessment/AssessmentQuiz';
import SearchParamsHandler from './search-params-handler';

export default function Home() {
  return (
    <Suspense fallback={null}>
      <SearchParamsHandler>
        <AssessmentQuiz />
      </SearchParamsHandler>
    </Suspense>
  );
}
