"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppContext } from "@/hooks/useAppContext";

const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
] as const;

const MAX_FILES_PER_SET = 3;

export default function PortfolioForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [job, setJob] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [cvDocs, setCvDocs] = useState<File[]>([]);
  const [certDocs, setCertDocs] = useState<File[]>([]);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!user?.id || user.id === "nil") return;
      try {
        const res = await axios.get(`/api/dbhandler?model=portfolio&userId=${user.id}`);
        const data = Array.isArray(res.data) ? res.data[0] ?? null : res.data ?? null;
        if (data) {
          setPortfolio(data);
          setJob(data.job || "");
          setJobDescription(data.jobDescription || "");
        }
      } catch (err) {
        console.error("Failed to load portfolio", err);
      }
    };

    loadPortfolio();
  }, [user?.id]);

  const totalImageCount = useMemo(() => images.length, [images]);
  const totalCvCount = useMemo(() => cvDocs.length, [cvDocs]);
  const totalCertCount = useMemo(() => certDocs.length, [certDocs]);

  const validateFiles = (files: File[], max: number) => {
    if (files.length > max) {
      toast.error(`You can only upload up to ${max} files in this section.`);
      return false;
    }

    const invalid = files.find((file) => !ACCEPTED_FILE_TYPES.includes(file.type as any));
    if (invalid) {
      toast.error("Only image, PDF, DOC, and DOCX files are allowed.");
      return false;
    }

    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(e.target.files ?? []);
    if (validateFiles(next, MAX_FILES_PER_SET)) {
      setImages(next);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(e.target.files ?? []);
    if (validateFiles(next, MAX_FILES_PER_SET)) {
      setCvDocs(next);
    }
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(e.target.files ?? []);
    if (validateFiles(next, MAX_FILES_PER_SET)) {
      setCertDocs(next);
    }
  };

  const submitPortfolio = async () => {
    if (!user?.id || user.id === "nil") {
      toast.error("Please sign in before creating a portfolio.");
      return;
    }

    if (!job.trim() && !jobDescription.trim()) {
      toast.error("Please enter your job title or job description.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("job", job);
      formData.append("jobDescription", jobDescription);

      images.forEach((file) => formData.append("images", file));
      cvDocs.forEach((file) => formData.append("cvDocuments", file));
      certDocs.forEach((file) => formData.append("certificationDocuments", file));

      if (portfolio?.id) {
        await axios.put(`/api/dbhandler?model=portfolio&id=${portfolio.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Portfolio updated successfully.");
      } else {
        await axios.post(`/api/dbhandler?model=portfolio`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Portfolio created successfully.");
      }

      onSubmitted?.();
    } catch (error: any) {
      console.error("Portfolio submission failed", error);
      toast.error(error?.response?.data?.error || "Portfolio save failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="portfolio-job">Job title</Label>
        <Input
          id="portfolio-job"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="e.g. Frontend Developer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio-description">Job description</Label>
        <Textarea
          id="portfolio-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Describe your experience, strengths, and what you do."
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio-images">Portfolio images ({totalImageCount}/{MAX_FILES_PER_SET})</Label>
        <Input id="portfolio-images" type="file" multiple accept="image/*" onChange={handleImageChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio-cvs">CV documents ({totalCvCount}/{MAX_FILES_PER_SET})</Label>
        <Input id="portfolio-cvs" type="file" multiple accept=".pdf,.doc,.docx" onChange={handleCvChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio-certs">Certification documents ({totalCertCount}/{MAX_FILES_PER_SET})</Label>
        <Input id="portfolio-certs" type="file" multiple accept=".pdf,.doc,.docx,image/*" onChange={handleCertChange} />
      </div>

      <Button type="button" onClick={submitPortfolio} disabled={loading} className="w-full">
        {loading ? "Saving..." : portfolio ? "Update portfolio" : "Create portfolio"}
      </Button>
    </div>
  );
}
