import { BookIcon, LockIcon, SparkIcon } from "../common/Icons";

export function TrustStrip() {
  return (
    <section className="trust-strip snap-section" aria-label="Sermon Prep principles">
      <div>
        <span className="trust-icon">
          <LockIcon />
        </span>
        <span>
          <strong>Private by design</strong>
          <small>Your study stays yours.</small>
        </span>
      </div>
      <div>
        <span className="trust-icon sage">
          <BookIcon />
        </span>
        <span>
          <strong>Scripture first</strong>
          <small>References, not distractions.</small>
        </span>
      </div>
      <div>
        <span className="trust-icon rose">
          <SparkIcon />
        </span>
        <span>
          <strong>Made for the moment</strong>
          <small>Move from insight to outline.</small>
        </span>
      </div>
      <div className="trust-aside">
        For the people who
        <br />
        <em>teach the Word.</em>
      </div>
    </section>
  );
}
