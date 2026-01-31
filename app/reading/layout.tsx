import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Reading Practice',
    description: 'Practice reading comprehension in your target language with AI-generated texts and questions aligned to CEFR standards.',
};

export default function ReadingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
