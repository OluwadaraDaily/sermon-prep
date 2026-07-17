import { motion } from "framer-motion";

import { features, type FeatureContent } from "../../content/landingContent";
import { ArrowIcon, Icon } from "../common/Icons";

export function FeaturesSection() {
  return (
    <section className="feature-section snap-section" id="features">
      <div className="section-heading reveal">
        <div>
          <p className="kicker light">
            <span className="kicker-rule" /> The useful kind of clever
          </p>
          <h2>
            Keep your study
            <br />
            <em>in the room.</em>
          </h2>
        </div>
        <p>
          Everything you need to gather the biblical threads already present in your
          thinking — without sending you down another rabbit hole.
        </p>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <FeatureCard feature={feature} key={feature.number} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: FeatureContent }) {
  return (
    <motion.article
      className={`feature-card ${feature.accent} reveal`}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
    >
      <div className="feature-card-top">
        <span>{feature.number}</span>
        <span className="feature-icon">
          <Icon name={feature.icon} />
        </span>
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.copy}</p>
      <span className="feature-arrow">
        <ArrowIcon />
      </span>
    </motion.article>
  );
}
