import { useEffect, useMemo, useRef, useState } from "react";
import { API } from "../../api";
import ImageUpload from "./ImageUpload";
import VideoUpload from "./VideoUpload";
import InstagramEmbedInput from "./InstagramEmbedInput";
import { useToast } from "../../context/ToastContext";

// Treat as "edit" only when product has a valid server id (duplicate/temp have no or temp id)
const isEditProduct = (p) =>
  p && (p.id != null && p.id !== "") && !String(p.id).startsWith("temp-");

function parseProductImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

const OPTIMISTIC_DELAY_MS = 1000;

export default function ProductForm({
  product,
  categories,
  occasions = [],
  onSave,
  onCancel,
  /** Optimistic create: called after 1s with temp product to show in list */
  onOptimisticAdd,
  /** Optimistic success: called with (tempId, serverProduct) so parent can replace temp with real */
  onOptimisticSuccess,
  /** Optimistic failure: called with tempId so parent can remove temp product and re-enable form */
  onOptimisticFailure,
}) {
  const toast = useToast();
  const isEdit = isEditProduct(product);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    badge: "",
    isFestival: false,
    isNew: false,
    isTrending: false,
    isReady60Min: false,
    hasSinglePrice: false,
    singlePrice: "",
    originalPrice: "", // MRP for single-price products
    keywords: "",
  });
  const [sizes, setSizes] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]); // Reusable size options from API
  const [imageItems, setImageItems] = useState([]); // { type: 'existing', url } | { type: 'new', id, file, objectURL? }
  const [videos, setVideos] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [instagramEmbeds, setInstagramEmbeds] = useState([]);
  const [linkedReels, setLinkedReels] = useState([]);
  const [loadingLinkedReels, setLoadingLinkedReels] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSizeOptions, setLoadingSizeOptions] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [descriptionLanguage, setDescriptionLanguage] = useState("English");
  const formRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const initialSnapshotRef = useRef("");

  const snapshot = useMemo(() => {
    return JSON.stringify({
      formData,
      sizes,
      imageItemsLength: imageItems.length,
      imageItemsOrder: imageItems.map((i) => (i.type === "existing" ? i.url : i.id)),
      selectedCategories,
      selectedOccasions,
    });
  }, [formData, sizes, imageItems, selectedCategories, selectedOccasions]);

  const isDirty = initialSnapshotRef.current !== "" && snapshot !== initialSnapshotRef.current;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        badge: product.badge || "",
        isFestival: product.isFestival || false,
        isNew: product.isNew || false,
        isTrending: product.isTrending || false,
        isReady60Min: product.isReady60Min || false,
        hasSinglePrice: product.hasSinglePrice || false,
        singlePrice: product.singlePrice ? String(product.singlePrice) : "",
        originalPrice: product.originalPrice != null ? String(product.originalPrice) : "",
        keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
      });
      setSizes(
        product.sizes && product.sizes.length > 0
          ? product.sizes.map((s) => ({
              label: s.label,
              price: String(s.price ?? ""),
              originalPrice: s.originalPrice != null ? String(s.originalPrice) : "",
            }))
          : []
      );
      setImageItems((prev) => {
        prev.forEach((i) => {
          if (i.type === "new" && i.objectURL) URL.revokeObjectURL(i.objectURL);
        });
        return parseProductImages(product.images).map((url) => ({ type: "existing", url }));
      });
      setExistingVideos(product.videos && Array.isArray(product.videos) ? product.videos : []);
      setInstagramEmbeds(product.instagramEmbeds && Array.isArray(product.instagramEmbeds) ? product.instagramEmbeds : []);
      // Handle both old (categoryId) and new (categories) format for backward compatibility
      if (product.categories && product.categories.length > 0) {
        setSelectedCategories(product.categories.map((pc) => pc.categoryId || pc.category?.id || pc.id));
      } else if (product.categoryId) {
        setSelectedCategories([product.categoryId]);
      } else {
        setSelectedCategories([]);
      }
      setSelectedOccasions(
        product.occasions && product.occasions.length > 0
          ? product.occasions.map((o) => o.occasionId || o.occasion?.id || o.id)
          : []
      );
    } else {
      // Reset form
      setFormData({
        name: "",
        description: "",
        badge: "",
        isFestival: false,
        isNew: false,
        isTrending: false,
        isReady60Min: false,
        hasSinglePrice: false,
        singlePrice: "",
        originalPrice: "",
        keywords: "",
      });
      setSizes([]);
      setImageItems([]);
      setInstagramEmbeds([]);
      setSelectedCategories([]);
      setSelectedOccasions([]);
    }

    // snapshot after state settles
    setTimeout(() => {
      initialSnapshotRef.current = JSON.stringify({
        formData: product
          ? {
              name: product.name || "",
              description: product.description || "",
              badge: product.badge || "",
              isFestival: product.isFestival || false,
              isNew: product.isNew || false,
              isTrending: product.isTrending || false,
              isReady60Min: product.isReady60Min || false,
              hasSinglePrice: product.hasSinglePrice || false,
              singlePrice: product.singlePrice ? String(product.singlePrice) : "",
              originalPrice: product.originalPrice != null ? String(product.originalPrice) : "",
              keywords: product.keywords ? (Array.isArray(product.keywords) ? product.keywords.join(", ") : product.keywords) : "",
            }
          : {
              name: "",
              description: "",
              badge: "",
              isFestival: false,
              isNew: false,
              isTrending: false,
              isReady60Min: false,
              hasSinglePrice: false,
              singlePrice: "",
              originalPrice: "",
              keywords: "",
            },
        sizes:
          product?.sizes && product.sizes.length > 0
            ? product.sizes.map((s) => ({ label: s.label, price: s.price, originalPrice: s.originalPrice }))
            : [],
        existingVideos: product?.videos && Array.isArray(product.videos) ? product.videos : [],
        selectedCategories:
          product?.categories && product.categories.length > 0
            ? product.categories.map((pc) => pc.categoryId || pc.category?.id || pc.id)
            : product?.categoryId
            ? [product.categoryId]
            : [],
        selectedOccasions:
          product?.occasions && product.occasions.length > 0
            ? product.occasions.map((o) => o.occasionId || o.occasion?.id || o.id)
            : [],
        imageItemsLength: product ? parseProductImages(product.images).length : 0,
        imageItemsOrder: product ? parseProductImages(product.images).join(",") : "",
      });
    }, 0);
  }, [product]);

  // Fetch reusable size options when form mounts
  useEffect(() => {
    let cancelled = false;
    setLoadingSizeOptions(true);
    fetch(`${API}/size-options`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setSizeOptions(data);
      })
      .catch(() => {})
      .finally(() => setLoadingSizeOptions(false));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isEdit || !product?.id) {
      setLinkedReels([]);
      setLoadingLinkedReels(false);
      return;
    }

    let cancelled = false;
    const token = localStorage.getItem("adminToken");
    setLoadingLinkedReels(true);

    fetch(`${API}/reels/all`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load reels");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const reels = Array.isArray(data) ? data : [];
        setLinkedReels(
          reels.filter((r) => Number(r.productId ?? r.product?.id) === Number(product.id))
        );
      })
      .catch(async () => {
        // Fallback to public reels endpoint (active reels only)
        try {
          const res = await fetch(`${API}/reels`);
          const data = await res.json();
          if (cancelled) return;
          const reels = Array.isArray(data) ? data : [];
          setLinkedReels(
            reels.filter((r) => Number(r.productId ?? r.product?.id) === Number(product.id))
          );
        } catch {
          if (!cancelled) setLinkedReels([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLinkedReels(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEdit, product?.id]);

  useEffect(() => {
    if (!isEdit || !product?.id) return;

    let cancelled = false;
    fetch(`${API}/products/${product.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch full product details");
        return res.json();
      })
      .then((fullProduct) => {
        if (cancelled || !fullProduct) return;

        setFormData({
          name: fullProduct.name || "",
          description: fullProduct.description || "",
          badge: fullProduct.badge || "",
          isFestival: fullProduct.isFestival || false,
          isNew: fullProduct.isNew || false,
          isTrending: fullProduct.isTrending || false,
          isReady60Min: fullProduct.isReady60Min || false,
          hasSinglePrice: fullProduct.hasSinglePrice || false,
          singlePrice: fullProduct.singlePrice ? String(fullProduct.singlePrice) : "",
          originalPrice: fullProduct.originalPrice != null ? String(fullProduct.originalPrice) : "",
          keywords: fullProduct.keywords
            ? (Array.isArray(fullProduct.keywords) ? fullProduct.keywords.join(", ") : fullProduct.keywords)
            : "",
        });

        setSizes(
          fullProduct.sizes && fullProduct.sizes.length > 0
            ? fullProduct.sizes.map((s) => ({
                label: s.label,
                price: String(s.price ?? ""),
                originalPrice: s.originalPrice != null ? String(s.originalPrice) : "",
              }))
            : []
        );

        setImageItems((prev) => {
          prev.forEach((i) => {
            if (i.type === "new" && i.objectURL) URL.revokeObjectURL(i.objectURL);
          });
          return parseProductImages(fullProduct.images).map((url) => ({ type: "existing", url }));
        });
        setExistingVideos(fullProduct.videos && Array.isArray(fullProduct.videos) ? fullProduct.videos : []);
        setInstagramEmbeds(
          fullProduct.instagramEmbeds && Array.isArray(fullProduct.instagramEmbeds)
            ? fullProduct.instagramEmbeds
            : []
        );

        if (fullProduct.categories && fullProduct.categories.length > 0) {
          setSelectedCategories(fullProduct.categories.map((pc) => pc.categoryId || pc.category?.id || pc.id));
        } else if (fullProduct.categoryId) {
          setSelectedCategories([fullProduct.categoryId]);
        } else {
          setSelectedCategories([]);
        }

        setSelectedOccasions(
          fullProduct.occasions && fullProduct.occasions.length > 0
            ? fullProduct.occasions.map((o) => o.occasionId || o.occasion?.id || o.id)
            : []
        );
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
      });

    return () => {
      cancelled = true;
    };
  }, [isEdit, product?.id]);

  const buildFormPayload = () => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("badge", formData.badge);
    formDataToSend.append("isFestival", formData.isFestival);
    formDataToSend.append("isNew", formData.isNew);
    formDataToSend.append("isTrending", formData.isTrending);
    formDataToSend.append("isReady60Min", formData.isReady60Min);
    formDataToSend.append("hasSinglePrice", formData.hasSinglePrice);
    formDataToSend.append("singlePrice", formData.hasSinglePrice && formData.singlePrice ? formData.singlePrice : "");
    formDataToSend.append("originalPrice", formData.hasSinglePrice && formData.originalPrice ? formData.originalPrice : "");
    let keywordsArray = [];
    if (formData.keywords && formData.keywords.trim() !== "") {
      keywordsArray = formData.keywords.split(",").map((k) => k.trim()).filter(Boolean);
    } else {
      keywordsArray = generateKeywords(formData.name);
    }
    formDataToSend.append("keywords", JSON.stringify(keywordsArray));
    formDataToSend.append("categoryIds", JSON.stringify(selectedCategories));
    if (formData.hasSinglePrice) {
      formDataToSend.append("sizes", JSON.stringify([]));
    } else {
      formDataToSend.append(
        "sizes",
        JSON.stringify(
          sizes.filter((s) => s.label && s.price).map((s) => ({
            label: s.label,
            price: s.price,
            originalPrice: s.originalPrice != null && s.originalPrice !== "" ? s.originalPrice : null,
          }))
        )
      );
    }
    formDataToSend.append("occasionIds", JSON.stringify(selectedOccasions));
    const orderedExisting = imageItems.filter((i) => i.type === "existing").map((i) => i.url);
    const orderedNewFiles = imageItems.filter((i) => i.type === "new").map((i) => i.file);
    const imageOrderPayload = imageItems.map((i) => (i.type === "existing" ? i.url : "NEW"));
    if (product && (orderedExisting.length > 0 || orderedNewFiles.length > 0)) {
      formDataToSend.append("existingImages", JSON.stringify(orderedExisting));
      if (isEdit && imageOrderPayload.length > 0) {
        formDataToSend.append("imageOrder", JSON.stringify(imageOrderPayload));
      }
    }
    if (product && existingVideos.length > 0) {
      formDataToSend.append("existingVideos", JSON.stringify(existingVideos));
    }
    orderedNewFiles.forEach((file) => formDataToSend.append("images", file));
    videos.forEach((file) => formDataToSend.append("videos", file));
    formDataToSend.append("instagramEmbeds", JSON.stringify(instagramEmbeds));
    return formDataToSend;
  };

  const buildOptimisticProduct = (tempId) => {
    const imageUrls = imageItems.map((i) => (i.type === "existing" ? i.url : i.objectURL || ""));
    const resolvedCategories = (categories || []).filter((c) => selectedCategories.includes(c.id)).map((c) => ({ id: c.id, name: c.name }));
    return {
      id: tempId,
      name: formData.name || "Untitled",
      description: (formData.description || "").slice(0, 200),
      order: 0,
      images: imageUrls.filter(Boolean),
      categories: resolvedCategories,
      isFestival: !!formData.isFestival,
      isNew: !!formData.isNew,
      isTrending: !!formData.isTrending,
      hasSinglePrice: !!formData.hasSinglePrice,
      singlePrice: formData.hasSinglePrice && formData.singlePrice ? parseFloat(formData.singlePrice) : null,
      sizes: sizes.filter((s) => s.label && s.price).map((s) => ({ label: s.label, price: parseFloat(s.price) || 0, originalPrice: null })),
    };
  };

  const resetFormState = () => {
    setFormData({
      name: "",
      description: "",
      badge: "",
      isFestival: false,
      isNew: false,
      isTrending: false,
      isReady60Min: false,
      hasSinglePrice: false,
      singlePrice: "",
      originalPrice: "",
      keywords: "",
    });
    setSizes([]);
    setImageItems((prev) => {
      prev.forEach((i) => {
        if (i.type === "new" && i.objectURL) URL.revokeObjectURL(i.objectURL);
      });
      return [];
    });
    setSelectedCategories([]);
    setSelectedOccasions([]);
    initialSnapshotRef.current = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }
    if (formData.hasSinglePrice && (!formData.singlePrice || parseFloat(formData.singlePrice) <= 0)) {
      toast.error("Please enter a valid single price for this product");
      return;
    }

    setLoading(true);
    isSubmittingRef.current = true;

    const isOptimisticCreate = !isEdit && onOptimisticAdd && onOptimisticSuccess && onOptimisticFailure;

    if (isOptimisticCreate) {
      if (product && String(product.id).startsWith("temp-")) {
        onOptimisticFailure(product.id);
      }
      const tempId = `temp-${Date.now()}`;
      const optimisticProduct = buildOptimisticProduct(tempId);
      setTimeout(() => {
        onOptimisticAdd(optimisticProduct);
        toast.success("Product added successfully");
      }, OPTIMISTIC_DELAY_MS);

      try {
        const token = localStorage.getItem("adminToken");
        const formDataToSend = buildFormPayload();
        const res = await fetch(`${API}/products`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        });
        const data = await res.json();

        if (res.ok) {
          onOptimisticSuccess(tempId, data);
          resetFormState();
          onSave();
        } else {
          onOptimisticFailure(tempId);
          toast.error(data.error || data.message || "Failed to save product. Please try again.");
        }
      } catch (error) {
        onOptimisticFailure(tempId);
        toast.error(error.message || "Failed to save product. Please try again.");
      } finally {
        setLoading(false);
        isSubmittingRef.current = false;
      }
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const formDataToSend = buildFormPayload();
      const url = isEdit ? `${API}/products/${product.id}` : `${API}/products`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(isEdit ? "Product updated" : "Product created");
        onSave();
        resetFormState();
      } else {
        toast.error(data.error || data.message || "Failed to save product");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (loading) return;
    if (isDirty) {
      const ok = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!ok) return;
    }
    // Reset to blank (create mode) and exit edit mode
    setFormData({
      name: "",
      description: "",
      badge: "",
      isFestival: false,
      isNew: false,
      isTrending: false,
      isReady60Min: false,
      hasSinglePrice: false,
      singlePrice: "",
      originalPrice: "",
      keywords: "",
    });
    setSizes([]);
    setImageItems((prev) => {
      prev.forEach((i) => {
        if (i.type === "new" && i.objectURL) URL.revokeObjectURL(i.objectURL);
      });
      return [];
    });
    setVideos([]);
    setExistingVideos([]);
    setSelectedCategories([]);
    setSelectedOccasions([]);
    initialSnapshotRef.current = "";
    onCancel?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return;
    }
    if (e.key === "Enter") {
      const tag = e.target?.tagName;
      if (tag === "TEXTAREA") return;
      if (loading) return;
      // Let selects behave normally; still allow Enter to submit otherwise
      e.preventDefault();
      formRef.current?.requestSubmit?.();
    }
  };

  const addSize = () => {
    setSizes([...sizes, { label: "", price: "" }]);
  };

  const removeSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index, field, value) => {
    const newSizes = [...sizes];
    if (!newSizes[index]) return;
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
  };

  // Toggle saved size option: add/remove from sizes with price/originalPrice
  const toggleSizeOption = (label) => {
    const existing = sizes.find((s) => (s.label || "").trim().toLowerCase() === (label || "").trim().toLowerCase());
    if (existing) {
      setSizes(sizes.filter((s) => (s.label || "").trim().toLowerCase() !== (label || "").trim().toLowerCase()));
    } else {
      setSizes([...sizes, { label: label.trim(), price: "", originalPrice: "" }]);
    }
  };

  // Add custom size and optionally save to reusable options
  const addCustomSize = async (label, saveAsReusable = false) => {
    const trimmed = (label || "").trim();
    if (!trimmed) return;
    if (sizes.some((s) => (s.label || "").trim().toLowerCase() === trimmed.toLowerCase())) {
      toast.error("This size is already added");
      return;
    }
    setSizes([...sizes, { label: trimmed, price: "", originalPrice: "" }]);
    if (saveAsReusable) {
      try {
        const token = localStorage.getItem("adminToken");
        await fetch(`${API}/size-options`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ label: trimmed }),
        });
      } catch (_) {}
    }
  };

  // Generate product description via backend (one-time per product when cached; Regenerate forces new)
  const handleGenerateDescription = async (forceRegenerate = false) => {
    if (!formData.name?.trim()) {
      toast.error("Enter product name first");
      return;
    }
    setGeneratingDescription(true);
    try {
      const categoryNames = selectedCategories
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const occasionNames = selectedOccasions
        .map((id) => occasions.find((o) => o.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const sizeVariant = sizes.map((s) => s.label).filter(Boolean).join(", ");
      let priceRange = "";
      if (formData.hasSinglePrice && formData.singlePrice) {
        priceRange = `₹${formData.singlePrice}`;
      } else if (sizes.length > 0) {
        const prices = sizes.map((s) => s.price).filter((p) => p != null && p !== "");
        if (prices.length) priceRange = `₹${Math.min(...prices.map(Number))} - ₹${Math.max(...prices.map(Number))}`;
      }
      const payload = {
        product_name: formData.name.trim(),
        category: categoryNames || "General",
        size: sizeVariant || "One size",
        material: "",
        color: "",
        target_audience: "",
        price_range: priceRange || "",
        use_case: occasionNames || "",
        features: formData.keywords || formData.badge || "",
        language: descriptionLanguage,
      };
      if (isEdit && product?.id) {
        payload.productId = product.id;
        payload.forceRegenerate = forceRegenerate;
      }
      const firstImageItem = imageItems?.length > 0 ? imageItems[0] : null;
      const firstImageUrl =
        firstImageItem?.type === "existing" ? firstImageItem.url : null;
      if (firstImageUrl) {
        payload.imageUrl = firstImageUrl.startsWith("http") ? firstImageUrl : `${API}${firstImageUrl.startsWith("/") ? "" : "/"}${firstImageUrl}`;
      }
      const res = await fetch(`${API}/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      if (data.description) setFormData((prev) => ({ ...prev, description: data.description }));
      toast.success(data.fromCache ? "Description loaded from cache" : "Description generated");
    } catch (e) {
      toast.error(e.message || "Could not generate description");
    } finally {
      setGeneratingDescription(false);
    }
  };

  // Generate keywords from product name
  const generateKeywords = (productName) => {
    if (!productName || productName.trim() === "") {
      return [];
    }
    
    // Convert to lowercase and split by spaces, hyphens, and other separators
    const words = productName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .split(/[\s-]+/) // Split by spaces and hyphens
      .filter(word => word.length > 2) // Filter out very short words
      .filter((word, index, self) => self.indexOf(word) === index); // Remove duplicates
    
    // Also add the full name as a keyword (if it's not too long)
    if (productName.length <= 50) {
      words.unshift(productName.toLowerCase().trim());
    }
    
    return words;
  };

  // Track previous product name to detect changes
  const prevProductNameRef = useRef("");
  const isInitialLoadRef = useRef(true);
  
  // Auto-generate keywords when product name changes
  useEffect(() => {
    // On initial load, set the ref and skip auto-generation
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevProductNameRef.current = formData.name || "";
      return;
    }
    
    // Only auto-generate if name actually changed (not on initial load)
    if (formData.name && formData.name.trim() !== "" && formData.name !== prevProductNameRef.current) {
      const autoKeywords = generateKeywords(formData.name);
      const keywordsString = autoKeywords.join(", ");
      
      setFormData(prev => ({
        ...prev,
        keywords: keywordsString
      }));
      
      prevProductNameRef.current = formData.name;
    } else if (!formData.name || formData.name.trim() === "") {
      // Clear keywords if name is empty
      setFormData(prev => ({
        ...prev,
        keywords: ""
      }));
      prevProductNameRef.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name]);
  
  // Reset initial load flag when product changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    prevProductNameRef.current = "";
  }, [product]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h2>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit?.()}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500/40 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            )}
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Categories *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 rounded-xl border-2 border-gray-200 bg-gray-50/50">
            {[...categories]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                      isSelected ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white hover:border-pink-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter((id) => id !== cat.id));
                        } else {
                          setSelectedCategories([...selectedCategories, cat.id]);
                        }
                      }}
                      className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">{cat.name}</span>
                  </label>
                );
              })}
          </div>
          {selectedCategories.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">Select at least one category.</p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="block text-sm font-semibold text-gray-700">Description *</label>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={descriptionLanguage}
                onChange={(e) => setDescriptionLanguage(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500"
                disabled={generatingDescription}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
              <button
                type="button"
                onClick={() => handleGenerateDescription(false)}
                disabled={generatingDescription}
                className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {generatingDescription ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate description"
                )}
              </button>
              {isEdit && product?.id && (
                <button
                  type="button"
                  onClick={() => handleGenerateDescription(true)}
                  disabled={generatingDescription}
                  className="text-sm px-3 py-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg font-medium hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Regenerate
                </button>
              )}
            </div>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
            rows="4"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Badge (e.g., 60 Min Delivery)</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFestival}
                  onChange={(e) => setFormData({ ...formData, isFestival: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Festival Item</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">New Arrival</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Trending</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isReady60Min}
                  onChange={(e) => setFormData({ ...formData, isReady60Min: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">60 Minutes Ready</span>
              </label>
            </div>
          </div>
        </div>

        {occasions.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Occasions (optional)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-3 rounded-xl border-2 border-gray-200 bg-gray-50/50">
              {[...occasions]
                .filter((o) => o.isActive !== false)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((occ) => {
                  const isSelected = selectedOccasions.includes(occ.id);
                  return (
                    <label
                      key={occ.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                        isSelected ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white hover:border-pink-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedOccasions(selectedOccasions.filter((id) => id !== occ.id));
                          } else {
                            setSelectedOccasions([...selectedOccasions, occ.id]);
                          }
                        }}
                        className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 shrink-0"
                      />
                      <span className="text-sm font-medium text-gray-700 truncate">{occ.name}</span>
                    </label>
                  );
                })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select occasions this product is suitable for (optional)</p>
          </div>
        )}

        <ImageUpload
          imageItems={imageItems}
          onImageItemsChange={setImageItems}
        />

        <VideoUpload
          videos={videos}
          existingVideos={existingVideos}
          onVideosChange={setVideos}
          onExistingVideosChange={setExistingVideos}
        />

        <InstagramEmbedInput
          instagramEmbeds={instagramEmbeds}
          onChange={setInstagramEmbeds}
        />

        <div className="rounded-xl border-2 border-gray-200 bg-gray-50/50 p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Linked Reels</label>
          {!isEdit || !product?.id ? (
            <p className="text-sm text-gray-600">Save this product first, then linked reels will appear here automatically.</p>
          ) : loadingLinkedReels ? (
            <p className="text-sm text-gray-600">Loading linked reels...</p>
          ) : linkedReels.length === 0 ? (
            <p className="text-sm text-gray-600">No reels linked to this product yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {linkedReels.map((reel) => (
                <div key={reel.id} className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                  {reel.thumbnail ? (
                    <img src={reel.thumbnail} alt={reel.title || `Reel ${reel.id}`} className="w-full aspect-video object-cover" />
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      No thumbnail
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-700 truncate">{reel.title || `Reel #${reel.id}`}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{reel.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.hasSinglePrice}
                onChange={(e) => {
                  setFormData({ ...formData, hasSinglePrice: e.target.checked });
                  // Clear sizes when switching to single price
                  if (e.target.checked) {
                    setSizes([]);
                  }
                }}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-semibold text-gray-700">No Size / Single Variant</span>
            </label>
          </div>

          {formData.hasSinglePrice ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selling Price *</label>
                <input
                  type="number"
                  value={formData.singlePrice}
                  onChange={(e) => setFormData({ ...formData, singlePrice: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 999"
                  required={formData.hasSinglePrice}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price / MRP (optional)</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 1499 (shown struck through)"
                />
                <p className="text-xs text-gray-500 mt-1">Displayed as strikethrough; discount % is auto-calculated.</p>
              </div>
              <p className="text-xs text-gray-500">This product has a single price without size variants.</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Sizes & Prices (Optional)</label>
              </div>
              {/* Reusable size options as checkboxes */}
              {sizeOptions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Select saved sizes (then set price/MRP below):</p>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((opt) => {
                      const isSelected = sizes.some((s) => (s.label || "").trim().toLowerCase() === (opt.label || "").trim().toLowerCase());
                      return (
                        <label
                          key={opt.id}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                            isSelected ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSizeOption(opt.label)}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Custom size: add one-off or save for future */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <input
                  type="text"
                  id="custom-size-label"
                  placeholder="Custom size"
                  className="flex-1 min-w-[120px] px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target;
                      addCustomSize(input.value, false);
                      input.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("custom-size-label");
                    if (input) {
                      addCustomSize(input.value, false);
                      input.value = "";
                    }
                  }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("custom-size-label");
                    if (input) {
                      addCustomSize(input.value, true);
                      input.value = "";
                      toast.success("Size added and saved for future products");
                    }
                  }}
                  className="px-4 py-2.5 border-2 border-pink-500 text-pink-600 rounded-lg text-sm font-semibold hover:bg-pink-50 transition"
                >
                  Add & save for future
                </button>
              </div>
              {/* Size rows: label, selling price, MRP */}
              <div className="space-y-3">
                {sizes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No sizes added. Select from above or add a custom size.</p>
                ) : (
                  sizes.map((size, index) => (
                    <div key={index} className="flex flex-wrap gap-2 items-center p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="font-semibold text-gray-700 min-w-[4rem]">{size.label}</span>
                      <input
                        type="number"
                        placeholder="Selling price"
                        value={size.price}
                        onChange={(e) => updateSize(index, "price", e.target.value)}
                        className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition text-sm"
                        step="0.01"
                        min="0"
                      />
                      <input
                        type="number"
                        placeholder="MRP (optional)"
                        value={size.originalPrice ?? ""}
                        onChange={(e) => updateSize(index, "originalPrice", e.target.value)}
                        className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition text-sm"
                        step="0.01"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              )}
              {isEdit ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
