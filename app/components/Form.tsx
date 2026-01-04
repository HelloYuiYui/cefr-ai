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
                    className="userInput" 
                    name="userInput" 
                    rows={10} 
                    cols={50}
                    onChange={(e) => {
                        const wordCount = e.currentTarget.value.trim().split(/\s+/).filter(word => word.length > 0).length;
                        const counter = document.getElementById('wordCounter');
                        if (counter) counter.textContent = `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`;
                    }}
                />
                <br />
                <div id="wordCounter" className="wordCounter">0 words</div>
                <button className="submitButton" type="submit">{t('analyze')}</button>
            </form>
        </div>
    );
}
// e.currentTarget.elements.namedItem('userInput') as HTMLTextAreaElement).value