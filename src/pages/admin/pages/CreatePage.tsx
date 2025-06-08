import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Editor from '@/components/Editor';
import { supabase } from '@/lib/supabaseClient';

const CreatePage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        meta_description: '',
        is_published: false,
        created_by: '',
    });

    useEffect(() => {
        const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user) {
            setForm(form => ({ ...form, created_by: user.id }));
        } else {
            console.error('No logged in user or error:', error);
        }
        };
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
console.log('Submitting form data:', form);
        try {
            const { data, error } = await supabase.from('cms_pages').insert([form]);

            if (error) {
                console.error('Supabase error:', error.message);
                return;
            }

            console.log('Page created:', data);
            navigate('/admin/pages', { state: { refresh: true } });
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

      return (
    <div className="p-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Page</CardTitle>
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
                    onChange={(value) => setForm({ ...form, content: value })}
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
            <Button type="submit">Create Page</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )

}

export default CreatePage;