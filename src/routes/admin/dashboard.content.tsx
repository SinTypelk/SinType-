import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { FileText, HelpCircle, Info, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminFetchSiteContent,
  adminSaveAboutContent,
  adminSaveFaqContent,
  adminSavePrivacyContent,
} from "@/lib/admin-content-service";
import type { AboutContent, FaqEntry, PrivacyContent, PrivacySection } from "@/lib/content-types";
import { DESKTOP_FAQ_ENTRIES, WEBSITE_FAQ_ENTRIES } from "@/lib/faq-content";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard/content")({
  component: ContentManagerPage,
});

const DEFAULT_ABOUT: AboutContent = {
  paragraphs: [
    "SinType began as a Singlish typing tool and is evolving into a full typing ecosystem with a built-in Local Web Server for mobile-to-PC sync.",
    "Pair your phone over Wi-Fi for wireless touchpad, keyboard, and file transfer — all on your private LAN.",
    "The core Singlish engine still supports Unicode and Legacy FM Abhaya for web and Windows.",
  ],
  fontRows: [
    ["Legacy display", "FM Abhaya", "Newspapers, books, government print"],
    ["Legacy headline", "FM Gemunu", "Banners, TV chyrons, posters"],
    ["Unicode standard", "Noto Sans Sinhala", "Web UI, mobile apps"],
    ["Unicode editorial", "Abhaya Libre", "Digital books, responsive web"],
  ],
};

function ContentManagerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [privacy, setPrivacy] = useState<PrivacyContent>({ subtitle: "", sections: [] });
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [faqWeb, setFaqWeb] = useState<FaqEntry[]>(WEBSITE_FAQ_ENTRIES);
  const [faqDesktop, setFaqDesktop] = useState<FaqEntry[]>(DESKTOP_FAQ_ENTRIES);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchSiteContent();
      if (data.privacy_policy) {
        const p = data.privacy_policy as PrivacyContent;
        setPrivacy({
          subtitle: p.subtitle ?? "",
          sections: p.sections?.length ? p.sections : [],
        });
      }
      if (data.about) {
        const a = data.about as AboutContent;
        setAbout({
          paragraphs: a.paragraphs?.length ? a.paragraphs : DEFAULT_ABOUT.paragraphs,
          fontRows: a.fontRows?.length ? a.fontRows : DEFAULT_ABOUT.fontRows,
        });
      }
      if (data.faq) {
        const f = data.faq as { web?: FaqEntry[]; desktop?: FaqEntry[] };
        if (f.web?.length) setFaqWeb(f.web);
        if (f.desktop?.length) setFaqDesktop(f.desktop);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const savePrivacy = async () => {
    setSaving("privacy");
    try {
      await adminSavePrivacyContent(privacy);
      toast.success("Privacy policy saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(null);
    }
  };

  const saveAbout = async () => {
    setSaving("about");
    try {
      await adminSaveAboutContent(about);
      toast.success("About page saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(null);
    }
  };

  const saveFaq = async () => {
    setSaving("faq");
    try {
      await adminSaveFaqContent({ web: faqWeb, desktop: faqDesktop });
      toast.success("FAQ saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(null);
    }
  };

  const updateSection = (index: number, patch: Partial<PrivacySection>) => {
    setPrivacy((p) => ({
      ...p,
      sections: p.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  };

  const addSection = () => {
    setPrivacy((p) => ({
      ...p,
      sections: [...p.sections, { title: "New section", body: "" }],
    }));
  };

  const removeSection = (index: number) => {
    setPrivacy((p) => ({
      ...p,
      sections: p.sections.filter((_, i) => i !== index),
    }));
  };

  const updateFaq = (
    tab: "web" | "desktop",
    index: number,
    patch: Partial<FaqEntry>,
  ) => {
    const setter = tab === "web" ? setFaqWeb : setFaqDesktop;
    setter((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addFaq = (tab: "web" | "desktop") => {
    const setter = tab === "web" ? setFaqWeb : setFaqDesktop;
    setter((items) => [...items, { q: "New question?", a: "" }]);
  };

  const removeFaq = (tab: "web" | "desktop", index: number) => {
    const setter = tab === "web" ? setFaqWeb : setFaqDesktop;
    setter((items) => items.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading content…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Content
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">App Content Manager</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit Privacy Policy, FAQ, and About text. Empty sections fall back to built-in defaults on the public site.
        </p>
      </div>

      <Tabs defaultValue="privacy" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="privacy" className="gap-2">
            <FileText className="h-4 w-4" /> Privacy
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" /> FAQ
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <Info className="h-4 w-4" /> About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="privacy">
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>
                Section-based content replaces the default policy when at least one section is saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Textarea
                  value={privacy.subtitle}
                  onChange={(e) => setPrivacy((p) => ({ ...p, subtitle: e.target.value }))}
                  rows={2}
                />
              </div>

              {privacy.sections.map((section, i) => (
                <div key={i} className="rounded-lg border border-border/60 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Section {i + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(i)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(i, { title: e.target.value })}
                    placeholder="Section title"
                  />
                  <Textarea
                    value={section.body}
                    onChange={(e) => updateSection(i, { body: e.target.value })}
                    rows={5}
                    placeholder="Section body (plain text)"
                  />
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addSection} className="border-dashed">
                <Plus className="mr-2 h-4 w-4" /> Add section
              </Button>

              <Button
                onClick={savePrivacy}
                disabled={saving === "privacy"}
                className="bg-[image:var(--gradient-primary)] text-primary-foreground"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving === "privacy" ? "Saving…" : "Save privacy policy"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>Manage web converter and desktop app questions separately.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {(["web", "desktop"] as const).map((tab) => {
                const items = tab === "web" ? faqWeb : faqDesktop;
                return (
                  <div key={tab} className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {tab === "web" ? "Web converter" : "Desktop app"}
                    </h3>
                    {items.map((item, i) => (
                      <div key={i} className="rounded-lg border border-border/60 p-4 space-y-2">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFaq(tab, i)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={item.q}
                          onChange={(e) => updateFaq(tab, i, { q: e.target.value })}
                          placeholder="Question"
                        />
                        <Textarea
                          value={item.a}
                          onChange={(e) => updateFaq(tab, i, { a: e.target.value })}
                          rows={3}
                          placeholder="Answer"
                        />
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => addFaq(tab)} className="border-dashed">
                      <Plus className="mr-2 h-4 w-4" /> Add question
                    </Button>
                  </div>
                );
              })}

              <Button
                onClick={saveFaq}
                disabled={saving === "faq"}
                className="bg-[image:var(--gradient-primary)] text-primary-foreground"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving === "faq" ? "Saving…" : "Save FAQ"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Intro paragraphs and font reference table.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {about.paragraphs.map((para, i) => (
                <div key={i} className="space-y-2">
                  <Label>Paragraph {i + 1}</Label>
                  <Textarea
                    value={para}
                    onChange={(e) =>
                      setAbout((a) => ({
                        ...a,
                        paragraphs: a.paragraphs.map((p, j) => (j === i ? e.target.value : p)),
                      }))
                    }
                    rows={3}
                  />
                </div>
              ))}

              <div className="space-y-3">
                <Label>Font table rows</Label>
                {about.fontRows.map((row, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-3">
                    {row.map((cell, j) => (
                      <Input
                        key={j}
                        value={cell}
                        onChange={(e) =>
                          setAbout((a) => ({
                            ...a,
                            fontRows: a.fontRows.map((r, ri) =>
                              ri === i
                                ? (r.map((c, ci) => (ci === j ? e.target.value : c)) as [
                                    string,
                                    string,
                                    string,
                                  ])
                                : r,
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>

              <Button
                onClick={saveAbout}
                disabled={saving === "about"}
                className="bg-[image:var(--gradient-primary)] text-primary-foreground"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving === "about" ? "Saving…" : "Save about page"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
