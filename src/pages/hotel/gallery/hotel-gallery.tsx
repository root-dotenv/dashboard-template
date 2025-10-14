// src/pages/hotel/gallery/hotel-gallery.tsx
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Plus,
  Image as ImageIcon,
  Edit,
  Trash2,
  Loader2,
  UploadCloud,
  X,
  Expand,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

// Assuming Swal is available globally via a script tag, e.g., from a CDN
declare const Swal: any;

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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// --- INLINE-DEFINED COMPONENTS TO RESOLVE IMPORTS ---

const hotelClient = axios.create({
  baseURL: "http://hotel.safaripro.net/api/v1/",
});

const DataLoadingError = ({
  title,
  subtitle,
  error,
}: {
  title: string;
  subtitle: string;
  error: Error;
}) => (
  <div className="flex flex-col items-center justify-center h-full text-center py-16">
    <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
      {title}
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">{subtitle}</p>
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm text-red-600 dark:text-red-400 w-full max-w-md overflow-x-auto">
      <code>{error.message}</code>
    </pre>
  </div>
);

// --- CONSTANTS ---
const HOTEL_ID = "552e27a3-7ac2-4f89-bc80-1349f3198105";

// --- TYPESCRIPT INTERFACES ---
interface ImageCategory {
  id: string;
  name: string;
}

interface HotelImage {
  id: string;
  original: string;
  caption: string;
  tag: string;
  category: string;
}

// --- API HELPER FUNCTIONS ---
const api = {
  getImageCategories: async (): Promise<ImageCategory[]> => {
    const response = await hotelClient.get("image-categories/");
    return response.data.results || [];
  },
  getHotelImages: async (): Promise<HotelImage[]> => {
    const response = await hotelClient.get(
      `hotel-images/?hotel_id=${HOTEL_ID}`
    );
    return response.data.results || [];
  },
  createImageCategory: async (data: {
    name: string;
  }): Promise<ImageCategory> => {
    const response = await hotelClient.post("image-categories/", data);
    return response.data;
  },
  updateImageCategory: async (payload: {
    id: string;
    name: string;
  }): Promise<ImageCategory> => {
    const response = await hotelClient.patch(
      `image-categories/${payload.id}/`,
      { name: payload.name }
    );
    return response.data;
  },
  deleteImageCategory: async (id: string): Promise<void> => {
    await hotelClient.delete(`image-categories/${id}/`);
  },
  createHotelImage: async (
    data: z.infer<typeof addImageSchema>
  ): Promise<HotelImage> => {
    const payload = { ...data, hotel: HOTEL_ID };
    const response = await hotelClient.post("hotel-images/", payload);
    return response.data;
  },
  deleteHotelImage: async (id: string): Promise<void> => {
    await hotelClient.delete(`hotel-images/${id}/`);
  },
};

// --- FORM SCHEMAS (ZOD) ---
const categorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters long."),
});

const addImageSchema = z.object({
  original: z.string().url("Please enter a valid image URL."),
  caption: z.string().min(3, "Caption must be at least 3 characters long."),
  tag: z.string().min(2, "Tag must be at least 2 characters long."),
  category: z.string().min(1, "Please select a category."),
  image_type: z.string().default("hotel-gallery"),
});

// --- REUSABLE COMPONENTS ---

const PlaceholderDropzone = () => (
  <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 pt-5 pb-6">
    <div className="space-y-1 text-center">
      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
      <div className="flex text-sm text-gray-600 dark:text-gray-400">
        <p className="pl-1">Upload a file (Coming Soon)</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500">
        PNG, JPG, GIF up to 10MB
      </p>
    </div>
  </div>
);

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
    mutationFn: api.createHotelImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelImages"] });
      toast.success("Image added to gallery successfully!");
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-[#FFF] hover:text-[#FFF]">
          <Plus className="h-4 w-4" /> Add Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939]">
        <DialogHeader>
          <DialogTitle className="dark:text-[#D0D5DD]">
            Add New Image
          </DialogTitle>
          <DialogDescription className="dark:text-[#98A2B3]">
            Provide image URL and details. File uploads coming soon.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(mutate)} className="space-y-4">
            <PlaceholderDropzone />
            <FormField
              control={form.control}
              name="original"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#D0D5DD]">
                    Image URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      className="bg-white dark:bg-[#171F2F] border-gray-300 dark:border-[#1D2939]"
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
                  <FormLabel className="dark:text-[#D0D5DD]">Caption</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Deluxe King Room View"
                      {...field}
                      className="bg-white dark:bg-[#171F2F] border-gray-300 dark:border-[#1D2939]"
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
                  <FormLabel className="dark:text-[#D0D5DD]">Tag</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., hotel-image"
                      {...field}
                      className="bg-white dark:bg-[#171F2F] border-gray-300 dark:border-[#1D2939]"
                    />
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
                  <FormLabel className="dark:text-[#D0D5DD]">
                    Category
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-[#171F2F] border-gray-300 dark:border-[#1D2939]">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939]">
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.id}
                          className="dark:text-[#D0D5DD] dark:focus:bg-[#1C2433]"
                        >
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
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
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

const ManageCategoriesDialog = ({
  categories,
}: {
  categories: ImageCategory[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ImageCategory | null>(
    null
  );
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
  });

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: api.createImageCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["imageCategories"] });
      toast.success(`Category "${data.name}" created.`);
      form.reset();
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: api.updateImageCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["imageCategories"] });
      toast.success(`Category updated to "${data.name}".`);
      setEditingCategory(null);
      form.reset();
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: api.deleteImageCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imageCategories"] });
      toast.success(`Category deleted successfully.`);
    },
    onError: (e) => toast.error(`Error: ${e.message}`),
  });

  const handleDelete = (category: ImageCategory) => {
    Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete the "${category.name}" category. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: document.body.classList.contains("dark") ? "#101828" : "#fff",
      color: document.body.classList.contains("dark") ? "#D0D5DD" : "#000",
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        deleteMutate(category.id);
      }
    });
  };

  const handleEdit = (category: ImageCategory) => {
    setEditingCategory(category);
    form.setValue("name", category.name);
  };

  const onSubmit = (values: z.infer<typeof categorySchema>) => {
    if (editingCategory) {
      updateMutate({ id: editingCategory.id, ...values });
    } else {
      createMutate(values);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        setEditingCategory(null);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="dark:bg-transparent border-[1.25px] border-[#E4E7EC] shadow-none  dark:border-[#1D2939] dark:text-[#D0D5DD] dark:hover:bg-[#1C2433]"
        >
          <Settings className="h-4 w-4" /> Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#101828] border-gray-200 dark:border-[#1D2939]">
        <DialogHeader>
          <DialogTitle className="dark:text-[#D0D5DD]">
            Manage Image Categories
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-[#171F2F]"
              >
                <p className="text-sm font-medium dark:text-[#D0D5DD]">
                  {cat.name}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 dark:text-[#98A2B3] dark:hover:bg-[#1C2433]"
                    onClick={() => handleEdit(cat)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-rose-500 hover:text-rose-600 dark:hover:bg-rose-900/40"
                    onClick={() => handleDelete(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 border-t dark:border-[#1D2939] pt-4"
          >
            <p className="font-semibold text-sm dark:text-[#D0D5DD]">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </p>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Category name..."
                      {...field}
                      className="bg-white dark:bg-[#171F2F] border-gray-300 dark:border-[#1D2939]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {editingCategory && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingCategory(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCategory ? "Save Changes" : "Create"}
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
  const [lightboxImage, setLightboxImage] = useState<HotelImage | null>(null);
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery<ImageCategory[]>({
    queryKey: ["imageCategories"],
    queryFn: api.getImageCategories,
  });

  const {
    data: images = [],
    isLoading: isLoadingImages,
    isError: isImagesError,
    error: imagesError,
  } = useQuery<HotelImage[]>({
    queryKey: ["hotelImages"],
    queryFn: api.getHotelImages,
  });

  const { mutate: deleteImageMutate } = useMutation({
    mutationFn: api.deleteHotelImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelImages"] });
      toast.success("Image deleted successfully.");
    },
    onError: (e) => toast.error(`Error deleting image: ${e.message}`),
  });

  const handleDeleteImage = (image: HotelImage) => {
    Swal.fire({
      title: "Delete Image?",
      text: `This will permanently delete the image "${image.caption}". This action cannot be undone.`,
      imageUrl: image.original,
      imageHeight: 200,
      imageAlt: image.caption,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: document.body.classList.contains("dark") ? "#101828" : "#fff",
      color: document.body.classList.contains("dark") ? "#D0D5DD" : "#000",
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        deleteImageMutate(image.id);
      }
    });
  };

  const filteredImages = useMemo(() => {
    if (activeTab === "all") return images;
    return images.filter(
      (image) =>
        image.category === categories.find((c) => c.name === activeTab)?.id
    );
  }, [activeTab, images, categories]);

  const bentoSpanClasses = [
    "col-span-2 row-span-2",
    "col-span-1 row-span-1",
    "col-span-1 row-span-2",
    "col-span-1 row-span-1",
    "col-span-2 row-span-1",
  ];

  if (isCategoriesError || isImagesError) {
    const error = new Error(
      [(categoriesError as Error)?.message, (imagesError as Error)?.message]
        .filter(Boolean)
        .join(" | ")
    );
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <DataLoadingError
          error={error}
          title="Hotel Service Unavailable"
          subtitle="We couldn't load the gallery data."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#101828]">
      {/* --- Page Header --- */}
      <div className="bg-white/90 dark:bg-[#101828]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#1D2939] sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-[#D0D5DD]">
                Hotel Gallery
              </h1>
              <p className="mt-1 text-gray-600 dark:text-[#98A2B3]">
                Manage your hotel's images and categories.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <ManageCategoriesDialog categories={categories} />
              <AddImageDialog categories={categories} />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {isLoadingCategories ? (
          <Skeleton className="h-10 w-full mb-6" />
        ) : (
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 w-max">
              <Button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold shadow-none transition-all duration-200",
                  activeTab === "all"
                    ? "bg-blue-600 text-[#FFF] hover:bg-blue-700"
                    : "text-[#1D2939] border-[1.25px] border-[#E4E7EC] bg-[#FFF] hover:bg-gray-200 dark:text-[#98A2B3] dark:hover:bg-[#1C2433] dark:bg-[#171F2F] dark:border-[#1D2939]"
                )}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setActiveTab(category.name)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold shadow-none transition-all duration-200",
                    activeTab === category.name
                      ? "bg-blue-600 text-[#FFF] hover:bg-blue-700"
                      : "text-[#1D2939] border-[1.25px] border-[#E4E7EC] bg-[#FFF] hover:bg-gray-200 dark:text-[#98A2B3] dark:hover:bg-[#1C2433] dark:bg-[#171F2F] dark:border-[#1D2939]"
                  )}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div>
          {isLoadingImages ? (
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn("rounded-xl", bentoSpanClasses[i % 5])}
                />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <Card className="text-center py-16 bg-white dark:bg-[#171F2F] border-gray-200 dark:border-[#1D2939]">
              <CardContent>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-[#5D636E]" />
                <h3 className="mt-4 text-lg font-semibold dark:text-[#D0D5DD]">
                  No Images Found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground dark:text-[#98A2B3]">
                  There are no images in this category.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
              {filteredImages.map((image, index) => (
                <Card
                  key={image.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl shadow transition-all duration-300 hover:shadow-md hover:scale-[1.02] dark:border-[#1D2939]",
                    bentoSpanClasses[index % 5]
                  )}
                >
                  <img
                    src={image.original}
                    alt={image.caption}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                    <p className="font-bold text-sm truncate">
                      {image.caption}
                    </p>
                    <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {image.tag}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={() => setLightboxImage(image)}
                    >
                      <Expand className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full bg-red-600/80 text-white hover:bg-red-700/90"
                      onClick={() => handleDeleteImage(image)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
              onClick={() => setLightboxImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <motion.img
              layoutId={lightboxImage.id}
              src={lightboxImage.original}
              alt={lightboxImage.caption}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
