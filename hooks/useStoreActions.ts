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
  const useMaster = Boolean(business && business.sections);

  const handleAddSection = async (type: string, layout: string) => {
    try {
      if (useMaster) {
        const newSection = {
          businessId: business.id,
          page: activePage?.slug || 'home',
          key: type,
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

  /**
   * Move a section up (-1) or down (+1) by swapping positions with its neighbour.
   * Uses an optimistic approach – no page reload needed; parent triggers onDataChange.
   */
  const handleMoveSection = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...sections].sort(
      (a, b) =>
        (a.position ?? a.order ?? 0) - (b.position ?? b.order ?? 0)
    );
    const currentIdx = sorted.findIndex((s) => s.id === id);
    if (currentIdx === -1) return;

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const current = sorted[currentIdx];
    const target = sorted[targetIdx];
    const currentPos = current.position ?? current.order ?? currentIdx;
    const targetPos = target.position ?? target.order ?? targetIdx;

    try {
      if (useMaster) {
        await Promise.all([
          axios.put('/api/dbhandler?model=businessSection', {
            id: current.id,
            position: targetPos,
          }),
          axios.put('/api/dbhandler?model=businessSection', {
            id: target.id,
            position: currentPos,
          }),
        ]);
      } else {
        await Promise.all([
          axios.put('/api/dbhandler?model=section', {
            id: current.id,
            order: targetPos,
          }),
          axios.put('/api/dbhandler?model=section', {
            id: target.id,
            order: currentPos,
          }),
        ]);
      }
      toast.success(`Section moved ${direction}`);
      onDataChange?.();
      window.location.reload();
    } catch {
      toast.error('Failed to move section');
    }
  };

  const handleApplyTemplate = async (templateSlug: string) => {
    if (!activePage && !useMaster) return;
    const template =
      DEFAULT_PAGE_TEMPLATES[templateSlug as keyof typeof DEFAULT_PAGE_TEMPLATES];
    if (!template || !('sections' in template)) return;

    try {
      for (const s of template.sections) {
        if (useMaster) {
          await axios.post('/api/dbhandler?model=businessSection', {
            businessId: business.id,
            page: activePage?.slug || 'home',
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
      if (data.siteSettings) {
        await axios.put('/api/dbhandler?model=siteSettings', {
          id: business?.siteSettings?.id,
          ...data.siteSettings,
        });
      }

      const projectData = { ...data };
      delete projectData.siteSettings;

      if (Object.keys(projectData).length > 0) {
        await axios.put('/api/dbhandler?model=projectSettings', {
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

  const handleReorderSections = async (updates: { id: string, position: number }[]) => {
    try {
      const promises = updates.map(u => 
        useMaster 
          ? axios.put('/api/dbhandler?model=businessSection', { id: u.id, position: u.position })
          : axios.put('/api/dbhandler?model=section', { id: u.id, order: u.position })
      );
      await Promise.all(promises);
      toast.success('Layout updated successfully');
    } catch {
      toast.error('Failed to save layout order');
    }
  };

  const handleDuplicateSection = async (section: any) => {
    try {
      const { id, createdAt, updatedAt, position, order, ...rest } = section;
      const nextPos = (position ?? order ?? 0) + 1;

      if (useMaster) {
        await axios.post('/api/dbhandler?model=businessSection', {
          ...rest,
          businessId: business.id,
          page: activePage?.slug || 'home',
          position: nextPos,
        });
      } else {
        await axios.post('/api/dbhandler?model=section', {
          ...rest,
          pageId: activePage.id,
          order: nextPos,
        });
      }

      toast.success('Section duplicated!');
      onDataChange?.();
      window.location.reload();
    } catch (err) {
      toast.error('Failed to duplicate section');
    }
  };

  return {
    handleAddSection,
    handleCreatePage,
    handleRemoveSection,
    handleMoveSection,
    handleReorderSections,
    handleDuplicateSection,
    handleApplyTemplate,
    updateGlobalSettings,
  };
}
