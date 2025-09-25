import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Image as ImageIcon, Edit, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// --- CONSTANTS ---
const VITE_HOTEL_BASE_URL = "http://hotel.safaripro.net/api/v1";
// NOTE: As requested, the hotel ID is hardcoded for now.
const HOTEL_ID = "a3d5501e-c910-4e2e-a0b2-ad616c5910db";

// --- TYPESCRIPT INTERFACES ---
interface ImageCategory {
  id: string;
  name: string;
  is_active: boolean;
}

interface HotelImage {
  id: string;
  original: string;
  caption: string;
  tag: string;
  category: string;
  category_name?: string;
}

// --- API HELPER FUNCTIONS (Your Implementation) ---
const getImageCategories = async (): Promise<ImageCategory[]> => {
  const response = await fetch(`${VITE_HOTEL_BASE_URL}/image-categories/`);
  if (!response.ok) throw new Error("Failed to fetch image categories.");
  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
};

const getHotelImages = async (): Promise<HotelImage[]> => {
  const response = await fetch(
    `${VITE_HOTEL_BASE_URL}/hotel-images/?hotel_id=${HOTEL_ID}`
  );
  if (!response.ok) throw new Error("Failed to fetch hotel images.");
  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
};

const createImageCategory = async (data: {
  name: string;
}): Promise<ImageCategory> => {
  const payload = { name: data.name, is_active: true };
  const response = await fetch(`${VITE_HOTEL_BASE_URL}/image-categories/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create category.");
  }
  return response.json();
};

const createHotelImage = async (data: {
  tag: string;
  image_type: string;
  caption: string;
  category: string;
  original: string;
}): Promise<HotelImage> => {
  const payload = { ...data, hotel: HOTEL_ID };
  const response = await fetch(`${VITE_HOTEL_BASE_URL}/hotel-images/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to add image.");
  }
  return response.json();
};

// --- FORM SCHEMAS (ZOD) (Your Implementation) ---
const addCategorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters long."),
});

const addImageSchema = z.object({
  original: z.string().url("Please enter a valid image URL."),
  caption: z.string().min(3, "Caption must be at least 3 characters long."),
  tag: z.string().min(2, "Tag must be at least 2 characters long."),
  category: z.string().min(1, "Please select a category."),
  image_type: z.string().default("hotel-gallery"),
});

// --- REUSABLE COMPONENTS (Your Forms Design) ---
const AddCategoryDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof addCategorySchema>>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: { name: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createImageCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["imageCategories"] });
      toast.success(`Category "${data.name}" created successfully!`);
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (values: z.infer<typeof addCategorySchema>) =>
    mutate(values);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Create Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Image Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your hotel images.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Lobby, Suites, Restaurant"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const AddImageDialog = ({ categories }: { categories: ImageCategory[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof addImageSchema>>({
    resolver: zodResolver(addImageSchema),
    defaultValues: {
      original: "",
      caption: "",
      tag: "",
      category: "",
      image_type: "hotel-gallery",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createHotelImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelImages"] });
      toast.success("Image added to gallery successfully!");
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (values: z.infer<typeof addImageSchema>) => mutate(values);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Image</DialogTitle>
          <DialogDescription>
            Upload a new image by providing its URL and details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="original"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Deluxe King Room View"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., hotel image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                Add Image
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// --- MAIN HOTEL GALLERY COMPONENT ---
export default function HotelGallery() {
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery<ImageCategory[]>({
    queryKey: ["imageCategories"],
    queryFn: getImageCategories,
  });
  const {
    data: images = [],
    isLoading: isLoadingImages,
    error: imagesError,
  } = useQuery<HotelImage[]>({
    queryKey: ["hotelImages"],
    queryFn: getHotelImages,
  });

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {} as Record<string, string>);
  }, [categories]);

  const filteredImages = useMemo(() => {
    if (activeTab === "all") return images;
    return images.filter((image) => categoryMap[image.category] === activeTab);
  }, [activeTab, images, categoryMap]);

  // Bento Grid classes from your implementation
  const bentoSpanClasses = [
    "col-span-2 row-span-2",
    "col-span-1 row-span-1",
    "col-span-1 row-span-2",
    "col-span-1 row-span-1",
    "col-span-2 row-span-1",
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-2 row-span-2",
    "col-span-1 row-span-2",
    "col-span-1 row-span-1",
  ];

  if (categoriesError || imagesError) {
    return (
      <div className="text-center text-red-500 p-8">
        Failed to load gallery data.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header from Enhanced Version */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Gallery</h1>
          <p className="text-muted-foreground">
            Manage your hotel's images and categories.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <AddCategoryDialog />
          <AddImageDialog categories={categories} />
        </div>
      </div>

      {/* Tabs Navigation from Enhanced Version */}
      {isLoadingCategories ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Grid and Content Area */}
      <div className="mt-6">
        {isLoadingImages ? (
          // Using Skeleton loaders from enhanced version for better UX
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "rounded-xl",
                  bentoSpanClasses[i % bentoSpanClasses.length]
                )}
              />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Images Found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no images in this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          // Grid design from your implementation
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
            {filteredImages.map((image, index) => (
              <Card
                key={image.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
                  bentoSpanClasses[index % bentoSpanClasses.length]
                )}
              >
                <img
                  src={image.original}
                  alt={image.caption}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                  <p className="font-bold text-sm truncate">{image.caption}</p>
                  <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.tag}
                  </p>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full"
                    onClick={() =>
                      toast.info("Edit functionality coming soon!")
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full"
                    onClick={() =>
                      toast.info("Delete functionality coming soon!")
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
