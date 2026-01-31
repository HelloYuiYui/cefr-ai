import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Writing Practice',
    description: 'Practice writing in your target language and receive instant AI-powered feedback on grammar, vocabulary, and fluency aligned to CEFR standards.',
};

export default function WritingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
