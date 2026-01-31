import { useTranslations } from "next-intl";
import "./styles.css";
import logger from '@/lib/logger';

export default function Form({ proceedToReview }: { proceedToReview: (input: string) => void; }) {
    const t = useTranslations('FormPage');
    return (
        <div className="formContainer">
            <form className="form" onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('userInput') as HTMLTextAreaElement).value;
                logger.debug("Form submitted: ", input);
                proceedToReview(input as string);
            }}>
                <label htmlFor="userInput">{t('enterText')}</label>
                <br />
                <textarea
                    className="userInput w-full min-h-[200px] md:min-h-[300px] p-3 md:p-4 text-sm md:text-base"
                    name="userInput"
                    rows={10}
                    onChange={(e) => {
                        const wordCount = e.currentTarget.value.trim().split(/\s+/).filter(word => word.length > 0).length;
                        const counter = document.getElementById('wordCounter');
                        if (counter) counter.textContent = `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`;
                    }}
                />
                <br />
                <div id="wordCounter" className="wordCounter">0 words</div>
                <button className="submitButton min-h-[44px] w-full md:w-auto px-6 md:px-8 py-3 text-base md:text-lg" type="submit">{t('analyze')}</button>
            </form>
        </div>
    );
}
// e.currentTarget.elements.namedItem('userInput') as HTMLTextAreaElement).value