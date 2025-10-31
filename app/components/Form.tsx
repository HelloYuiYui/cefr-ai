import "./styles.css";

export default function Form({ proceedToReview }: { proceedToReview: () => void; }) {
    return (
        <div className="formContainer">
            <form className="form" onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('userInput') as HTMLTextAreaElement).value;
                console.log("Form submitted: ", input);
                proceedToReview();
            }}>
                <label htmlFor="userInput">Enter your text:</label>
                <br />
                <textarea className="userInput" name="userInput" rows={10} cols={50} />
                <br />
                <button className="submitButton" type="submit">Analyze</button>
            </form>
        </div>
    );
}
// e.currentTarget.elements.namedItem('userInput') as HTMLTextAreaElement).value