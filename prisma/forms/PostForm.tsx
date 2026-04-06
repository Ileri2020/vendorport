
'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/hooks/useAppContext";

export default function PostForm() {
  const { currentBusiness } = useAppContext();
  const [posts, setPosts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    authorId: '',
    type: 'image',
    for: 'General',
    event: '',
  });
  const [editId, setEditId] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, [currentBusiness?.id]);

  const fetchPosts = async () => {
    let url = '/api/dbhandler?model=post';
    if (currentBusiness?.id) url += `&businessId=${currentBusiness.id}`;
    const res = await axios.get(url);
    setPosts(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get('/api/dbhandler?model=user');
    setUsers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, businessId: currentBusiness?.id };
    if (editId) {
      await axios.put(`/api/dbhandler?model=post&id=${editId}`, data);
    } else {
      await axios.post('/api/dbhandler?model=post', data);
    }
    resetForm();
    fetchPosts();
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || '',
      description: item.description || '',
      url: item.url || '',
      authorId: item.authorId || '',
      type: item.type || 'image',
      for: item.for || 'General',
      event: item.event || '',
    });
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/dbhandler?model=post&id=${id}`);
    fetchPosts();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      authorId: '',
      type: 'image',
      for: 'General',
      event: '',
    });
    setEditId(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded-xl shadow-lg bg-card">
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <h2 className='font-bold text-xl text-center'>Manage Posts</h2>
        
        <div className="space-y-1">
          <Label>Author</Label>
          <Select value={formData.authorId} onValueChange={(v) => setFormData({ ...formData, authorId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Author" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Title</Label>
          <Input placeholder="Post Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Filter Tag (for)</Label>
            <Input placeholder="General, Blog, etc." value={formData.for} onChange={(e) => setFormData({ ...formData, for: e.target.value })} />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Content URL</Label>
          <Input placeholder="https://..." value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Input placeholder="Excerpt or content..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90">{editId ? 'Update Post' : 'Create Post'}</Button>
        {editId && <Button onClick={resetForm} variant="outline" className="w-full">Cancel</Button>}

        <div className="mt-6 border-t pt-4">
          <h3 className="font-bold mb-3">Recent Posts</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {posts.map((item, index) => (
              <div key={item.id} className="p-3 bg-muted rounded-lg flex flex-col gap-2 group">
                <div className="flex justify-between items-start">
                   <p className="font-bold text-sm truncate">{item.title || "Untitled"}</p>
                   <span className="text-[10px] uppercase font-black bg-accent/20 px-1.5 rounded">{item.type}</span>
                </div>
                <div className="flex gap-2">
                   <Button size="sm" onClick={() => handleEdit(item)} className="h-7 text-xs flex-1">Edit</Button>
                   <Button size="sm" onClick={() => handleDelete(item.id)} variant="ghost" className="h-7 text-xs flex-1 border text-destructive">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

