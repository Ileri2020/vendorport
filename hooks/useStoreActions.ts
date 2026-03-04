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
  onDataChange?: () => void;
}

export function useStoreActions({
  activePage,
  sections,
  settings,
  storeName,
  business,
  onDataChange,
}: Params) {
  const handleAddSection = async (type: string, layout: string) => {
    // Determine whether we are using the new master BusinessSection system
    const useMaster = Boolean(business && business.sections);
    try {
      if (useMaster) {
        const newSection = {
          businessId: business.id,
          page: activePage?.slug || 'home',
          // `key` should identify the section kind (e.g. 'hero'), not the layout
          key: type,
          // `type` here represents the section classification (static/dynamic/collection)
          type: 'static',
          position: sections.length,
          heading: `New ${type}`,
          subHeading: '',
          content: {},
          settings: { layout },
        };
        await axios.post('/api/dbhandler?model=businessSection', newSection);
      } else {
        if (!activePage) return;
        const newSection = {
          pageId: activePage.id,
          type,
          layout,
          order: sections.length,
          data: { title: `New ${type}`, text: 'Add your text here...' },
        };
        await axios.post('/api/dbhandler?model=section', newSection);
      }
      toast.success('Section added!');
      onDataChange?.();
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
        if (template && 'sections' in template) {
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
      onDataChange?.();
      window.location.href = `/${storeName}/${slug}`;
    } catch (err) {
      toast.error('Failed to create page');
    }
  };

  const handleRemoveSection = async (id: string) => {
    try {
      const useMaster = Boolean(business && business.sections);
      if (useMaster) {
        await axios.delete(`/api/dbhandler?model=businessSection&id=${id}`);
      } else {
        await axios.delete(`/api/dbhandler?model=section&id=${id}`);
      }
      toast.success('Section removed');
      onDataChange?.();
      window.location.reload();
    } catch (err) {
      toast.error('Failed to remove section');
    }
  };

  const handleApplyTemplate = async (templateSlug: string) => {
    if (!activePage && !(business && business.sections)) return;
    const template =
      DEFAULT_PAGE_TEMPLATES[templateSlug as keyof typeof DEFAULT_PAGE_TEMPLATES];
    if (!template || !('sections' in template)) return;

    try {
      const useMaster = Boolean(business && business.sections);
      for (const s of template.sections) {
        if (useMaster) {
          await axios.post('/api/dbhandler?model=businessSection', {
            businessId: business.id,
            page: activePage?.slug || 'home',
            // use the section type as the key (e.g. 'hero')
            key: s.type,
            type: 'static',
            position: s.order,
            heading: (s as any).data?.title || '',
            content: (s as any).data || {},
            settings: { layout: s.layout },
          });
        } else {
          await axios.post('/api/dbhandler?model=section', {
            pageId: activePage.id,
            type: s.type,
            layout: s.layout,
            order: s.order,
            data: (s as any).data,
          });
        }
      }
      toast.success(`Applied ${('name' in template ? template.name : templateSlug)} template!`);
      onDataChange?.();
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
      onDataChange?.();
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
