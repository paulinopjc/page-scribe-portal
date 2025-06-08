import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Editor from '@/components/Editor';
import { supabase } from '@/lib/supabaseClient';

const EditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // expects route like /admin/pages/edit/:id

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    is_published: false,
    created_by: '',
  });

  const [loading, setLoading] = useState(true);

  // Fetch page data by id on mount
  useEffect(() => {
    if (!id) return;

    const fetchPage = async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading page:', error);
      } else if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          content: data.content,
          meta_description: data.meta_description || '',
          is_published: data.is_published,
          created_by: data.created_by,
        });
      }
      setLoading(false);
    };

    fetchPage();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .update({
          title: form.title,
          slug: form.slug,
          content: form.content,
          meta_description: form.meta_description,
          is_published: form.is_published,
          created_by: form.created_by,
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      console.log('Page updated:', data);
      navigate('/admin/pages', { state: { refresh: true } });
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  if (loading) return <div>Loading page...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" value={form.slug} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Editor
                value={form.content}
                onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
                placeholder="Write your page content here..."
              />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                name="meta_description"
                value={form.meta_description}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="is_published"
                name="is_published"
                type="checkbox"
                checked={form.is_published}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <Label htmlFor="is_published">Publish this page</Label>
            </div>
            <div className="flex space-x-4">
              <Button type="submit">Update Page</Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/admin/pages')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPage;
