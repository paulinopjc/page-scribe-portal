import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/DataTable';

const ListPages = () => {
  const navigate = useNavigate(); // <-- here inside component
  const [pageList, setPageList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      const { data, error } = await supabase
        .from('cms_pages') // 👈 table name
        .select('*');

      if (error) {
        console.error('Error fetching pages:', error);
      } else {
        setPageList(data);
      }

      setLoading(false);
    };

    fetchPages();
  }, []);

  const handleEdit = (page) => {
    console.log('Edit', page);
    navigate(`/admin/pages/edit/${page.id}`);
  };

  const handleDelete = async (page) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) return;

    const { error } = await supabase.from('cms_pages').delete().eq('id', page.id); // make sure table name is correct
    if (error) {
      console.error('Delete error:', error);
      alert('Failed to delete page.');
      return;
    }

    setPageList(prev => prev.filter(p => p.id !== page.id));
  };

  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
    },
    {
      accessorKey: 'is_published',
      header: 'Status',
      cell: ({ getValue }) =>
        getValue() ? 'Published' : 'Draft',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const page = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(page)}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(page)}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  if (loading) return <div>Loading pages...</div>;

  return (
    <div>
      <h1>Manage Pages</h1>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Pages</h1>
        <button
          onClick={() => navigate('/admin/pages/create')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Create Page
        </button>
      </div>
      <DataTable columns={columns} data={pageList} />
    </div>
  );
};

export default ListPages;
