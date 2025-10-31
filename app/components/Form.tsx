import { useTranslations } from "next-intl";
import "./styles.css";

export default function Form({ proceedToReview }: { proceedToReview: (input: string) => void; }) {
    const t = useTranslations('FormPage');
    return (
        <div className="formContainer">
            <form className="form" onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('userInput') as HTMLTextAreaElement).value;
                console.log("Form submitted: ", input);
                proceedToReview(input as string);
            }}>
                <label htmlFor="userInput">{t('enterText')}</label>
                <br />
                <textarea className="userInput" name="userInput" rows={10} cols={50} />
                <br />
                <button className="submitButton" type="submit">{t('analyze')}</button>
            </form>
        </div>
    );
}
// e.currentTarget.elements.namedItem('userInput') as HTMLTextAreaElement).value