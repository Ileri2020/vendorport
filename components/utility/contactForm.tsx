"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import React, { useRef, useState, FormEvent } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useAppContext } from "@/hooks/useAppContext";

const ContactForm = () => {
  const { user } = useAppContext();
  const [details, setDetails] = useState({
    username: user?.name || "",
    email: user?.email || "",
    category: "suggestion",
    message: "",
    to: "admin",
    file: null as File | null,
  });

  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "file" && files?.length) {
      setDetails((prev) => ({ ...prev, file: files[0] }));
    } else {
      setDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!details.username || !details.email || !details.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const messageData = {
        userId: user?.id || "guest",
        senderName: details.username,
        senderEmail: details.email,
        subject: details.category,
        message: details.message,
      };

      const res = await fetch("/api/dbhandler?model=message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Message sent successfully! We'll respond soon.");
        formRef.current?.reset();
        setDetails({
          username: user?.name || "",
          email: user?.email || "",
          category: "suggestion",
          message: "",
          to: "admin",
          file: null,
        });
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while sending message");
    }
  };

  return (
    <>
      <Toaster />
      <form ref={formRef} onSubmit={sendMessage} className="flex flex-col gap-6 p-10 bg-secondary rounded-xl">
        <h3 className="text-4xl text-accent mb-7">Message Us</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="text"
            name="username"
            value={details.username}
            placeholder="Username"
            onChange={handleChange}
            className="rounded-sm bg-background"
          />
          <Input
            type="email"
            name="email"
            value={details.email}
            placeholder="Email address"
            onChange={handleChange}
            className="rounded-sm bg-background"
          />
        </div>

        <select
          name="category"
          value={details.category}
          onChange={handleChange}
          className="bg-secondary border-2 border-border h-8 ring-1 rounded-sm ring-accent/30"
        >
          <option value="suggestion">Suggestion</option>
          <option value="complaint">Complaint</option>
          <option value="advert">Advert</option>
          <option value="appreciate">Appreciate</option>
          <option value="question">Question</option>
          <option value="other">Other</option>
        </select>

        <Textarea
          className="h-[120px]"
          name="message"
          value={details.message}
          onChange={handleChange}
          placeholder="Type your message here"
        />

        <Input type="file" name="file" onChange={handleChange} className="bg-background rounded-sm" />

        <Button type="submit" className="before:ani-shadow">
          Submit
        </Button>
      </form>
    </>
  );
};

export default ContactForm;
