import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useContentStore, Content } from '@/store/contentStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  MoreVertical,
  Calendar,
  Instagram,
  Twitter,
  Youtube,
  TrendingUp,
  Trash2,
  Edit3,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const platformIcons = {
  instagram: <Instagram className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  tiktok: <TrendingUp className="h-4 w-4" />,
};

const statusColors = {
  draft: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  published: 'bg-green-500',
  failed: 'bg-red-500',
};

export function ContentList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { contents, loading, error, fetchContents, deleteContent } = useContentStore();

  useEffect(() => {
    fetchContents().catch((error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch content",
      });
    });
  }, [fetchContents, toast]);

  const handleDelete = async (content: Content) => {
    try {
      await deleteContent(content.id);
      toast({
        title: "Content Deleted",
        description: "The content has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete content",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-500">Error</h3>
          <p className="text-gray-400 mt-2">{error.message}</p>
          <Button
            onClick={() => fetchContents()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Content</h1>
            <p className="text-gray-400 mt-2">
              Manage and track your social media content
            </p>
          </div>
          <Button
            onClick={() => navigate('/content/create')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Create New Content
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <Card
              key={content.id}
              className="bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
            >
              {content.mediaUrls[0] && (
                <div className="aspect-video w-full overflow-hidden">
                  {content.mediaUrls[0].endsWith('.mp4') ? (
                    <video
                      src={content.mediaUrls[0]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={content.mediaUrls[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-white">{content.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {content.description.length > 100
                        ? `${content.description.slice(0, 100)}...`
                        : content.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/content/${content.id}`)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate(`/content/${content.id}/edit`)}
                        className="cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(content)}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    {platformIcons[content.platform as keyof typeof platformIcons]}
                    <span className="ml-1 capitalize">{content.platform}</span>
                  </div>
                  {content.scheduledFor && (
                    <>
                      <span>•</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(content.scheduledFor).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Badge
                  variant="secondary"
                  className={`${
                    statusColors[content.status as keyof typeof statusColors]
                  } text-white`}
                >
                  {content.status}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>

        {contents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-300">No content yet</h3>
            <p className="text-gray-400 mt-2">
              Get started by creating your first piece of content
            </p>
            <Button
              onClick={() => navigate('/content/create')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              Create Content
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
