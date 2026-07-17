import { steps, type StepContent } from "../../content/landingContent";
import { Icon } from "../common/Icons";

export function HowItWorksSection() {
  return (
    <section className="steps-section snap-section" id="how-it-works">
      <div className="section-heading centered reveal">
        <p className="kicker">
          <span className="kicker-rule" /> A simple rhythm
        </p>
        <h2>
          From a passing thought
          <br />
          to a <em>grounded message.</em>
        </h2>
        <p>Three small steps that leave more room for the work only you can do.</p>
      </div>
      <div className="steps-grid">
        {steps.map((step) => (
          <Step step={step} key={step.number} />
        ))}
      </div>
    </section>
  );
}

function Step({ step }: { step: StepContent }) {
  return (
    <article className="step reveal">
      <div className="step-number">{step.number}</div>
      <div className="step-icon">
        <Icon name={step.icon} />
      </div>
      <h3>{step.title}</h3>
      <p>{step.copy}</p>
    </article>
  );
}
