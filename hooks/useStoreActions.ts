"use client";

import axios from 'axios';
import { toast } from 'sonner';
import { DEFAULT_PAGE_TEMPLATES } from '@/lib/storeTemplates';

interface Params {
  activePage: any;
  sections: any[];
  settings?: any;
  storeName?: string | string[];
  business?: any;
}

export function useStoreActions({
  activePage,
  sections,
  settings,
  storeName,
  business,
}: Params) {
  const handleAddSection = async (type: string, layout: string) => {
    if (!activePage) return;
    try {
      const newSection = {
        pageId: activePage.id,
        type,
        layout,
        order: sections.length,
        data: { title: `New ${type}`, text: 'Add your text here...' },
      };
      await axios.post('/api/dbhandler?model=section', newSection);
      toast.success('Section added!');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to add section');
    }
  };

  const handleCreatePage = async (
    name: string,
    slug: string,
    templateSlug?: string
  ) => {
    try {
      const res = await axios.post('/api/dbhandler?model=page', {
        name,
        slug,
        projectSettingsId: settings?.id,
      });

      if (templateSlug) {
        const template =
          DEFAULT_PAGE_TEMPLATES[templateSlug as keyof typeof DEFAULT_PAGE_TEMPLATES];
        if (template) {
          for (const s of template.sections) {
            await axios.post('/api/dbhandler?model=section', {
              pageId: res.data.id,
              type: s.type,
              layout: s.layout,
              order: s.order,
              data: (s as any).data,
            });
          }
        }
      }

      toast.success('Page created!');
      window.location.href = `/${storeName}/${slug}`;
    } catch (err) {
      toast.error('Failed to create page');
    }
  };

  const handleRemoveSection = async (id: string) => {
    try {
      await axios.delete(`/api/dbhandler?model=section&id=${id}`);
      toast.success('Section removed');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to remove section');
    }
  };

  const handleApplyTemplate = async (templateSlug: string) => {
    if (!activePage) return;
    const template =
      DEFAULT_PAGE_TEMPLATES[templateSlug as keyof typeof DEFAULT_PAGE_TEMPLATES];
    if (!template) return;

    try {
      for (const s of template.sections) {
        await axios.post('/api/dbhandler?model=section', {
          pageId: activePage.id,
          type: s.type,
          layout: s.layout,
          order: s.order,
          data: (s as any).data,
        });
      }
      toast.success(`Applied ${template.name} template!`);
      window.location.reload();
    } catch (err) {
      toast.error('Failed to apply template');
    }
  };

  const updateGlobalSettings = async (data: any) => {
    try {
      // Update SiteSettings if present
      if (data.siteSettings) {
        await axios.put(`/api/dbhandler?model=siteSettings`, {
          id: business?.siteSettings?.id,
          ...data.siteSettings,
        });
      }

      // Update ProjectSettings if present (currency, etc)
      const projectData = { ...data };
      delete projectData.siteSettings;

      if (Object.keys(projectData).length > 0) {
        await axios.put(`/api/dbhandler?model=projectSettings`, {
          id: settings?.id,
          ...projectData,
        });
      }

      toast.success('Settings updated!');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  return {
    handleAddSection,
    handleCreatePage,
    handleRemoveSection,
    handleApplyTemplate,
    updateGlobalSettings,
  };
}
