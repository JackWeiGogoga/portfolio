import Layout from "@/components/Layout";
import React from "react";
import { useTranslation } from "react-i18next";
import overviewImg from "@/assets/images/flowlet/overview.png";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { CodeBlock } from "@/components/ui/code-block";
import { InlineCode } from "@/components/ui/inline-code";

type NodeItem = {
  title: string;
  problem: string;
  capabilities?: string[];
  usage?: string[];
  notes?: string[];
  codeSample?: string;
};

const Flowlet: React.FC = () => {
  const { t } = useTranslation("flowlet");
  const painPoints = t("why.painPoints", { returnObjects: true }) as string[];
  const layers = t("architecture.layers", {
    returnObjects: true,
  }) as Array<{ title: string; description: string }>;
  const contextFields = t("architecture.contextFields", {
    returnObjects: true,
  }) as Array<{ name: string; description: string }>;
  const statePoints = t("architecture.statePoints", {
    returnObjects: true,
  }) as string[];
  const asyncChannels = t("async.channels", {
    returnObjects: true,
  }) as string[];
  const asyncKeyPoints = t("async.keyPoints", {
    returnObjects: true,
  }) as string[];
  const nodeLabels = t("nodes.labels", {
    returnObjects: true,
  }) as Record<string, string>;
  const nodeItems = t("nodes.items", { returnObjects: true }) as NodeItem[];
  const exampleSteps = t("example.steps", { returnObjects: true }) as string[];
  return (
    <Layout variant="portfolio">
      <header className="space-y-2 mt-8">
        <h1 className="font-mono text-graytext">{t("header.eyebrow")}</h1>
        <p className="text-lg font-medium">{t("header.title")}</p>
        <p className="text-sm text-graytext">{t("header.summary")}</p>
        <div className="flex flex-wrap gap-4 text-xs font-mono text-graytext">
          <a
            href="https://github.com/JackWeiGogoga/Flowlet"
            target="_blank"
            rel="noreferrer"
          >
            {t("header.links.repo")}
          </a>
          <a
            href="https://flowlet.gogoga.top/flows"
            target="_blank"
            rel="noreferrer"
          >
            {t("header.links.live")}
          </a>
        </div>
      </header>

      <article className="space-y-12 mt-10">
        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">{t("why.title")}</h2>
          <p className="text-sm">{t("why.intro")}</p>
          <ul className="list-disc pl-8 text-sm">
            {painPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <p className="text-sm">{t("why.goal")}</p>
          <LightboxImage
            src={overviewImg}
            alt="Flowlet workflow overview"
            caption={t("why.captionOverview")}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">
            {t("architecture.title")}
          </h2>
          <p className="text-sm">{t("architecture.intro")}</p>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              {t("architecture.layersTitle")}
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {layers.map((layer) => (
                <div
                  key={layer.title}
                  className="rounded-md border border-muted p-3 text-sm"
                >
                  <div className="font-medium">{layer.title}</div>
                  <p className="text-graytext mt-1">{layer.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t("architecture.contextTitle")}
            </h3>
            <p className="text-sm">{t("architecture.contextIntro")}</p>
            <ul className="list-disc pl-8 text-sm">
              {contextFields.map((field) => (
                <li key={field.name}>
                  <InlineCode>{field.name}</InlineCode> - {field.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t("architecture.stateTitle")}
            </h3>
            <p className="text-sm">{t("architecture.stateIntro")}</p>
            <ul className="list-disc pl-8 text-sm">
              {statePoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">
            {t("async.title")}
          </h2>
          <p className="text-sm">{t("async.intro")}</p>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("async.channelsTitle")}</h3>
            <ul className="list-disc pl-8 text-sm">
              {asyncChannels.map((channel, index) => (
                <li key={index}>{channel}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t("async.keyPointsTitle")}</h3>
            <ul className="list-disc pl-8 text-sm">
              {asyncKeyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">
            {t("nodes.title")}
          </h2>
          <p className="text-sm">{t("nodes.intro")}</p>
          <div className="space-y-4">
            {nodeItems.map((node) => (
              <div
                key={node.title}
                className="rounded-md border border-muted p-4 space-y-3"
              >
                <div className="text-sm font-medium">{node.title}</div>
                <div className="text-sm">
                  <div className="text-xs font-mono text-graytext uppercase">
                    {nodeLabels.problem}
                  </div>
                  <p>{node.problem}</p>
                </div>

                {node.capabilities && (
                  <div className="text-sm">
                    <div className="text-xs font-mono text-graytext uppercase">
                      {nodeLabels.capabilities}
                    </div>
                    <ul className="list-disc pl-6">
                      {node.capabilities.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {node.usage && (
                  <div className="text-sm">
                    <div className="text-xs font-mono text-graytext uppercase">
                      {nodeLabels.usage}
                    </div>
                    <ul className="list-disc pl-6">
                      {node.usage.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {node.notes && (
                  <div className="text-sm">
                    <div className="text-xs font-mono text-graytext uppercase">
                      {nodeLabels.notes}
                    </div>
                    <ul className="list-disc pl-6">
                      {node.notes.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {node.codeSample && (
                  <CodeBlock code={node.codeSample} language="python" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">
            {t("example.title")}
          </h2>
          <p className="text-sm">{t("example.intro")}</p>
          <ol className="list-decimal pl-8 text-sm">
            {exampleSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <p className="text-sm text-graytext">{t("example.note")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-mono text-graytext">
            {t("closing.title")}
          </h2>
          <div className="space-y-3 text-sm">
            {(t("closing.paragraphs", { returnObjects: true }) as string[]).map(
              (paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ),
            )}
          </div>
        </section>
      </article>
    </Layout>
  );
};

export default Flowlet;
