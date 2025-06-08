import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, FileText } from 'lucide-react';
import Editor from '@/components/Editor';

const Index = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPages();
  }, []);

  const fetchPublishedPages = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome to CMS</h1>
              <p className="text-muted-foreground mt-2">
                Content Management System Frontend
              </p>
            </div>
            <Link to="/auth">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Published Pages</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Pages Published</h3>
                <p className="text-muted-foreground mb-4">
                  There are no published pages to display yet.
                </p>
                <Link to="/auth">
                  <Button>Go to Admin Panel</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page: any) => (
                <Card key={page.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{page.title}</CardTitle>
                    {page.meta_description && (
                      <CardDescription>{page.meta_description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link to={`/page/${page.slug}`}>
                      <Button className="w-full">Read More</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="text-center">
          <Card>
            <CardHeader>
              <CardTitle>About This CMS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This is a content management system built with React, Supabase, and modern web technologies.
                Administrators can create, edit, and publish pages through the admin panel.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/auth">
                  <Button variant="outline">Admin Panel</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;