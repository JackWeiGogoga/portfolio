import Layout from "@/components/Layout";
import React from "react";
import overviewImg from "@/assets/images/flowlet/overview.png";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { CodeBlock } from "@/components/ui/code-block";
import { Quote } from "@/components/ui/quote";
import { InlineCode } from "@/components/ui/inline-code";

const codeSample = `type PipelineStage = "ingest" | "normalize" | "enrich";

interface EventFrame {
  id: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

export function routeEvent(stage: PipelineStage, frame: EventFrame) {
  if (stage === "enrich" && !frame.payload.userId) {
    throw new Error("Missing userId for enrichment");
  }

  return {
    ...frame,
    payload: {
      ...frame.payload,
      stage,
    },
  };
}`;

const Flowlet: React.FC = () => {
  return (
    <Layout variant="portfolio">
      <header className="space-y-2 mt-8">
        <h1 className="font-mono text-graytext">Flowlet (2023-2025)</h1>
        <p>
          A content audit workflow platform that blends realtime queues, quality
          checks, and an operator-friendly UI.
        </p>
      </header>

      <article className="space-y-12 mt-10">
        <section className="space-y-2">
          <h2 className="text-sm font-mono text-graytext">Overview</h2>
          <p>
            Flowlet is built to orchestrate moderation workflows with a tight
            feedback loop. The focus is on clear queue handoffs, deterministic
            decisions, and traceable quality metrics powered by{" "}
            <InlineCode>EventFrame</InlineCode>.
          </p>
          <LightboxImage
            src={overviewImg}
            alt="Flowlet workflow overview"
            caption="A high-level view of ingestion, routing, and quality control."
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">Key Decisions</h2>
          <ul className="list-disc pl-8">
            <li>
              Separation of ingest and enrichment stages to keep throughput
              predictable under load.
            </li>
            <li>
              Idempotent events so replays never create duplicate work for
              reviewers.
            </li>
            <li>
              Metrics-first design: every moderation touch point emits
              structured signals.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">Key Decisions</h2>
          <ol className="list-decimal pl-8">
            <li>
              Separation of ingest and enrichment stages to keep throughput
              predictable under load.
            </li>
            <li>
              Idempotent events so replays never create duplicate work for
              reviewers.
            </li>
            <li>
              Metrics-first design: every moderation touch point emits
              structured signals.
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">
            Sample Routing Logic
          </h2>
          <p>
            This snippet shows how the pipeline guards enrichment inputs before
            handing off to the classifier.
          </p>
          <CodeBlock code={codeSample} language="ts" />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">What Users Said</h2>
          <Quote author="Ops Lead, Trust & Safety">
            Flowlet cut our audit time in half because every case arrives with
            consistent metadata and clear ownership.
          </Quote>
        </section>
      </article>
    </Layout>
  );
};

export default Flowlet;
