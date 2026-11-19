import React, { useEffect, useRef, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase.js";
import ProductImagePicker from "./ProductImagePicker.jsx";
import { uploadStoryImage, removeStoryImage } from "./lib/storyImages.js";
import {
  DEFAULT_PHOTO_LIMIT,
  gallerySignature,
  photosFromProduct,
  removeUploadedFiles,
  resolveImageSrc,
  uploadGallery,
  validatePhotos,
} from "./lib/productImages.js";
import "./Admin.css";


function formatHomepageLabel(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function updateHomepagePath(source, path, nextValue) {
  if (path.length === 0) return nextValue;
  const [key, ...remaining] = path;

  if (Array.isArray(source)) {
    return source.map((item, index) =>
      String(index) === String(key)
        ? updateHomepagePath(item, remaining, nextValue)
        : item
    );
  }

  return {
    ...(source || {}),
    [key]: updateHomepagePath(source?.[key], remaining, nextValue),
  };
}

function HomepageSectionEditor({ section, disabled, onChange }) {
  const content = section.content || {};

  function field(label, path, multiline = false) {
    let value = content;
    for (const part of path) value = value?.[part];
    if (value == null) value = "";

    return (
      <label className="admin-homepage-field" key={path.join(".")}>
        <span>{label}</span>
        {multiline ? (
          <textarea
            rows={4}
            value={value}
            disabled={disabled}
            onChange={(event) =>
              onChange(updateHomepagePath(content, path, event.target.value))
            }
          />
        ) : (
          <input
            type="text"
            value={value}
            disabled={disabled}
            onChange={(event) =>
              onChange(updateHomepagePath(content, path, event.target.value))
            }
          />
        )}
      </label>
    );
  }

  function textList(label, key) {
    const values = Array.isArray(content[key]) ? content[key] : [];
    return (
      <fieldset className="admin-homepage-fieldset" key={key}>
        <legend>{label}</legend>
        <div className="admin-homepage-fields">
          {values.map((value, index) =>
            field(`${label} ${index + 1}`, [key, index], true)
          )}
        </div>
        <p className="admin-homepage-help">
          Edit the existing entries here. Adding or removing entries is not part
          of this editor yet.
        </p>
      </fieldset>
    );
  }

  function objectList(label, key, itemFields) {
    const values = Array.isArray(content[key]) ? content[key] : [];
    return (
      <fieldset className="admin-homepage-fieldset" key={key}>
        <legend>{label}</legend>
        <div className="admin-homepage-fields">
          {values.map((item, index) => (
            <div className="admin-homepage-array-item" key={index}>
              <h4>{label} {index + 1}</h4>
              {itemFields.map((itemField) =>
                field(
                  itemField.label,
                  [key, index, itemField.key],
                  itemField.multiline
                )
              )}
            </div>
          ))}
        </div>
      </fieldset>
    );
  }

  if (section.section_key === "hero") {
    return (
      <>
        <p className="admin-homepage-intro">
          This is the first message visitors see when they arrive at Flenzo.
        </p>
        {field("Location or small introductory line", ["location"])}
        {textList("Headline lines", "titleLines")}
        {field("Highlighted headline text", ["titleHighlight"])}
        {field("Main button label", ["buttonLabel"])}
      </>
    );
  }

  if (section.section_key === "culture") {
    return (
      <>
        <p className="admin-homepage-intro">
          Tell visitors about Flenzo's culture, values and purpose.
        </p>
        {field("Section heading", ["sectionHeading"])}
        {field("Small introductory label", ["eyebrow"])}
        {textList("Headline lines", "titleLines")}
        {field("Highlighted headline text", ["titleHighlight"])}
        {textList("Paragraphs", "paragraphs")}
        {objectList("Culture values", "values", [
          { label: "Value name", key: "label" },
          { label: "Value description", key: "text", multiline: true },
        ])}
        <fieldset className="admin-homepage-fieldset">
          <legend>Call-to-action block</legend>
          <div className="admin-homepage-fields">
            {field("Heading", ["cta", "title"])}
            {field("Supporting text", ["cta", "text"], true)}
            {field("Button label", ["cta", "buttonLabel"])}
          </div>
        </fieldset>
      </>
    );
  }

  if (section.section_key === "community") {
    return (
      <>
        <p className="admin-homepage-intro">
          Introduce the people and community around Flenzo.
        </p>
        {field("Section heading", ["sectionHeading"])}
        {field("Small introductory label", ["eyebrow"])}
        {textList("Headline lines", "titleLines")}
        {field("Highlighted headline text", ["titleHighlight"])}
        {field("Community description", ["text"], true)}
        {field("Card button label", ["cardButtonLabel"])}
      </>
    );
  }

  if (section.section_key === "impact") {
    return (
      <>
        <p className="admin-homepage-intro">
          Explain the difference Flenzo wants to make.
        </p>
        {field("Small introductory label", ["eyebrow"])}
        {textList("Headline lines", "titleLines")}
        {field("Highlighted headline text", ["titleHighlight"])}
        {textList("Supporting paragraphs", "paragraphs")}
        {objectList("Impact statements", "lines", [
          { label: "Number or figure", key: "number" },
          { label: "Short label", key: "word" },
          { label: "Explanation", key: "text", multiline: true },
        ])}
        {field("Closing note", ["note"], true)}
        {field("Highlighted closing text", ["noteBold"])}
      </>
    );
  }

  return (
    <p className="admin-error">
      This homepage section does not have a dedicated editor yet.
    </p>
  );
}

function HomepageLivePreview({ section }) {
  const content = section.content || {};
  const title = Array.isArray(content.titleLines)
    ? content.titleLines.filter(Boolean).join(" ")
    : "";

  return (
    <aside className="admin-homepage-preview" aria-label="Live text preview">
      <p className="admin-homepage-preview-label">LIVE TEXT PREVIEW</p>
      {content.location && <p className="admin-homepage-preview-eyebrow">{content.location}</p>}
      {content.eyebrow && <p className="admin-homepage-preview-eyebrow">{content.eyebrow}</p>}
      {content.sectionHeading && <p className="admin-homepage-preview-section">{content.sectionHeading}</p>}
      {title && (
        <h4>
          {title}{" "}
          {content.titleHighlight && (
            <span>{content.titleHighlight}</span>
          )}
        </h4>
      )}
      {content.buttonLabel && (
        <span className="admin-homepage-preview-button">{content.buttonLabel}</span>
      )}
      {content.cardButtonLabel && (
        <span className="admin-homepage-preview-button">{content.cardButtonLabel}</span>
      )}
      {content.paragraphs?.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      {content.text && <p>{content.text}</p>}
      {content.values?.map((item, index) => (
        <div className="admin-homepage-preview-item" key={index}>
          <strong>{item.label}</strong>
          <p>{item.text}</p>
        </div>
      ))}
      {content.lines?.map((item, index) => (
        <div className="admin-homepage-preview-item" key={index}>
          <strong>{item.number} {item.word}</strong>
          <p>{item.text}</p>
        </div>
      ))}
      {content.cta && (
        <div className="admin-homepage-preview-cta">
          <strong>{content.cta.title}</strong>
          <p>{content.cta.text}</p>
          {content.cta.buttonLabel && (
            <span className="admin-homepage-preview-button">
              {content.cta.buttonLabel}
            </span>
          )}
        </div>
      )}
      {content.note && <p>{content.note} <strong>{content.noteBold}</strong></p>}
      <p className="admin-homepage-help">
        Text preview only. The live site's layout, images and button destinations remain unchanged.
      </p>
    </aside>
  );
}

function AdminAppInner() {
  const [status, setStatus] = useState("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [activeStudioSection, setActiveStudioSection] = useState("overview");

  const [showStories, setShowStories] = useState(false);
  const [showHomepage, setShowHomepage] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [homepageSections, setHomepageSections] = useState([]);
  const [homepageLoading, setHomepageLoading] = useState(false);
  const [homepageError, setHomepageError] = useState("");
  const [homepageNotice, setHomepageNotice] = useState("");

  // Owner-only newsletter subscriber management.
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterSearch, setNewsletterSearch] = useState("");
  const [newsletterDeletingId, setNewsletterDeletingId] = useState(null);
  const [floatingNotification, setFloatingNotification] = useState(null);

  useEffect(() => {
    if (!floatingNotification || floatingNotification.type !== "success") return;
    const timeoutId = window.setTimeout(() => setFloatingNotification(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [floatingNotification]);
  const [homepageSavingId, setHomepageSavingId] = useState(null);

  const [adminStories, setAdminStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState("");
  const [storyActionBusyIds, setStoryActionBusyIds] = useState([]);
  const storyActionBusyIdsRef = useRef(new Set());
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [storyEditForm, setStoryEditForm] = useState({});
  const [storyEditSaving, setStoryEditSaving] = useState(false);
  const [storyEditError, setStoryEditError] = useState("");
  const [storyEditNotice, setStoryEditNotice] = useState("");

  const [storyImageFile, setStoryImageFile] = useState(null);
  const [storyImageUploading, setStoryImageUploading] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [createStorySaving, setCreateStorySaving] = useState(false);
  const [createStoryError, setCreateStoryError] = useState("");
  const [createStoryImageFile, setCreateStoryImageFile] = useState(null);
  const [createStoryForm, setCreateStoryForm] = useState({
    type: "culture",
    title: "",
    label: "",
    text: "",
    sort_order: 0,
  });
  const [adminProducts, setAdminProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [adminCategories, setAdminCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categoryActionBusyId, setCategoryActionBusyId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [editError, setEditError] = useState("");
  const [editNotice, setEditNotice] = useState("");
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createNotice, setCreateNotice] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: "",
    old_price: "",
    category_id: "",
    sizes: "S, M, L, XL",
    colors: "Black, White",
    active: false,
    featured: false,
  });

  // Photo lists for the create and edit forms. Each item is either an
  // existing stored image or a newly chosen file (see lib/productImages.js).
  // The limit is a code constant for now; it is not an admin setting yet.
  const maxPhotos = DEFAULT_PHOTO_LIMIT;
  const [createPhotos, setCreatePhotos] = useState([]);
  const [editPhotos, setEditPhotos] = useState([]);

  async function verifyAdmin(user) {
    if (!user) {
      setStatus("signedOut");
      setAdminEmail("");
      setAdminRole("");
      return;
    }

    setStatus("checking");
    setError("");
    setAdminRole("");

    const { data, error: queryError } = await supabase
      .from("admin_users")
      .select("user_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (queryError) {
      setError("We could not verify your admin access. Please try again.");
      setStatus("error");
      return;
    }

    if (!data || !["owner", "client"].includes(data.role)) {
      setAdminRole("");
      setAdminEmail(user.email || "");
      setStatus("denied");
      return;
    }

    setAdminEmail(user.email || "");
    setAdminRole(data.role);

    if (data.role === "client") {
      setActiveStudioSection("products");
      setShowProducts(true);
      setShowCategories(false);
      setShowStories(false);
      setShowHomepage(false);
    }

    setStatus("admin");
  }

  async function loadAdminProducts() {
    setProductsLoading(true);
    setProductsError("");

    try {
      const { data, error: queryError } = await supabase
        .from("products")
        .select("*");

      if (queryError) throw queryError;

      const { data: categoryData, error: categoryQueryError } = await supabase
        .from("categories")
        .select("id, name, sort_order, active")
        .order("sort_order");

      if (categoryQueryError) throw categoryQueryError;

      setAdminProducts(data || []);
      setAdminCategories(categoryData || []);
    } catch (err) {
      setProductsError(
        err.message || "Could not load products. Please try again."
      );
    } finally {
      setProductsLoading(false);
    }
  }

  function makeCategorySlug(value) {
    return value
      .normalize("NFKD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function loadAdminCategories() {
    setCategoriesLoading(true);
    setCategoriesError("");

    try {
      const { data, error: queryError } = await supabase
        .from("categories")
        .select("id, name, slug, sort_order, active")
        .order("sort_order", { ascending: true });

      if (queryError) throw queryError;
      setAdminCategories(data || []);
    } catch (err) {
      setCategoriesError(err.message || "Could not load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function createCategory(event) {
    event.preventDefault();
    setCategoriesError("");

    const name = categoryName.trim();
    if (!name) {
      setCategoriesError("Enter a category name.");
      return;
    }

    if (adminCategories.some(
      (category) => category.name.trim().toLowerCase() === name.toLowerCase()
    )) {
      setCategoriesError("A category with this name already exists.");
      return;
    }

    const baseSlug = makeCategorySlug(name);
    if (!baseSlug) {
      setCategoriesError("This name cannot be used to create a category URL.");
      return;
    }

    const slugExists = adminCategories.some((category) => category.slug === baseSlug);
    const slug = slugExists ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
    const nextOrder = adminCategories.reduce(
      (maximum, category) => Math.max(maximum, Number(category.sort_order) || 0),
      0
    ) + 1;

    setCategorySaving(true);
    try {
      const { data, error: insertError } = await supabase
        .from("categories")
        .insert({ name, slug, sort_order: nextOrder, active: true })
        .select("id, name, slug, sort_order, active")
        .single();

      if (insertError) throw insertError;

      setAdminCategories((current) => [...current, data]);
      setCategoryName("");
      setFloatingNotification({
        type: "success",
        message: `Category "${data.name}" created.`,
      });
    } catch (err) {
      setCategoriesError(err.message || "Could not create this category.");
    } finally {
      setCategorySaving(false);
    }
  }

  async function saveCategoryName(categoryId) {
    setCategoriesError("");

    const name = editingCategoryName.trim();
    if (!name) {
      setCategoriesError("Category name cannot be empty.");
      return;
    }

    const original = adminCategories.find((category) => category.id === categoryId);
    if (!original) {
      setCategoriesError("Category not found. Reload the categories.");
      return;
    }

    if (adminCategories.some(
      (category) =>
        category.id !== categoryId &&
        category.name.trim().toLowerCase() === name.toLowerCase()
    )) {
      setCategoriesError("A category with this name already exists.");
      return;
    }

    const baseSlug = makeCategorySlug(name);
    if (!baseSlug) {
      setCategoriesError("This name cannot be used to create a category URL.");
      return;
    }

    const slugExists = adminCategories.some(
      (category) => category.id !== categoryId && category.slug === baseSlug
    );
    const slug = name === original.name
      ? original.slug
      : slugExists
        ? `${baseSlug}-${Date.now().toString(36)}`
        : baseSlug;

    setCategoryActionBusyId(categoryId);
    try {
      const { data, error: updateError } = await supabase
        .from("categories")
        .update({ name, slug, updated_at: new Date().toISOString() })
        .eq("id", categoryId)
        .select("id, name, slug, sort_order, active")
        .single();

      if (updateError) throw updateError;

      setAdminCategories((current) =>
        current.map((category) => category.id === categoryId ? data : category)
      );
      setEditingCategoryId(null);
      setEditingCategoryName("");
      setFloatingNotification({
        type: "success",
        message: `Category renamed to "${data.name}".`,
      });
    } catch (err) {
      setCategoriesError(err.message || "Could not rename this category.");
    } finally {
      setCategoryActionBusyId(null);
    }
  }

  async function moveCategory(categoryId, direction) {
    setCategoriesError("");

    const ordered = [...adminCategories].sort(
      (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
    );
    const currentIndex = ordered.findIndex((item) => item.id === categoryId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
      return;
    }

    [ordered[currentIndex], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[currentIndex],
    ];

    setCategoryActionBusyId(categoryId);
    try {
      const updates = await Promise.all(
        ordered.map((category, index) =>
          supabase
            .from("categories")
            .update({
              sort_order: index + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", category.id)
        )
      );

      const failedUpdate = updates.find((result) => result.error);
      if (failedUpdate) throw failedUpdate.error;

      setAdminCategories(
        ordered.map((category, index) => ({ ...category, sort_order: index + 1 }))
      );
    } catch (err) {
      setCategoriesError(err.message || "Could not reorder categories. Reload and try again.");
      await loadAdminCategories();
    } finally {
      setCategoryActionBusyId(null);
    }
  }

  async function toggleCategory(category) {
    setCategoriesError("");
    setCategoryActionBusyId(category.id);

    try {
      const { data, error: updateError } = await supabase
        .from("categories")
        .update({
          active: !category.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", category.id)
        .select("id, name, slug, sort_order, active")
        .single();

      if (updateError) throw updateError;

      setAdminCategories((current) =>
        current.map((item) => item.id === category.id ? data : item)
      );
      setFloatingNotification({
        type: "success",
        message: `Category "${data.name}" ${data.active ? "activated" : "deactivated"}.`,
      });
    } catch (err) {
      setCategoriesError(err.message || "Could not update this category.");
    } finally {
      setCategoryActionBusyId(null);
    }
  }

  async function loadAdminStories() {
    setStoriesLoading(true);
    setStoriesError("");

    try {
      const { data, error: queryError } = await supabase
        .from("stories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (queryError) throw queryError;

      setAdminStories(data || []);
    } catch (err) {
      setStoriesError(
        err.message || "Could not load stories. Please try again."
      );
    } finally {
      setStoriesLoading(false);
    }
  }



  async function loadAdminHomepage() {
    setHomepageLoading(true);
    setHomepageError("");
    setHomepageNotice("");

    try {
      const { data, error: queryError } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (queryError) throw queryError;

      setHomepageSections(data || []);
    } catch (err) {
      setHomepageError(
        err.message || "Could not load homepage content. Please try again."
      );
    } finally {
      setHomepageLoading(false);
    }
  }

  async function loadNewsletterSubscribers() {
    if (adminRole !== "owner") return;

    setNewsletterLoading(true);
    setNewsletterError("");

    try {
      const { data, error: queryError } = await supabase
        .from("newsletter_subscribers")
        .select("id, email, consent, subscribed_at")
        .order("subscribed_at", { ascending: false });

      if (queryError) throw queryError;

      setNewsletterSubscribers(data || []);
    } catch (err) {
      console.error("Newsletter subscribers could not be loaded:", err);
      setNewsletterError(
        err.message || "Could not load newsletter subscribers. Please try again."
      );
    } finally {
      setNewsletterLoading(false);
    }
  }

  async function deleteNewsletterSubscriber(subscriber) {
    if (adminRole !== "owner" || newsletterDeletingId) return;

    const confirmed = window.confirm(
      `Remove ${subscriber.email} from the newsletter list? This cannot be undone.`
    );

    if (!confirmed) return;

    setNewsletterDeletingId(subscriber.id);
    setNewsletterError("");

    try {
      const { error: deleteError } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", subscriber.id);

      if (deleteError) throw deleteError;

      setNewsletterSubscribers((current) =>
        current.filter((item) => item.id !== subscriber.id)
      );
    } catch (err) {
      console.error("Newsletter subscriber could not be deleted:", err);
      setNewsletterError(
        err.message || "Could not remove this subscriber. Please try again."
      );
    } finally {
      setNewsletterDeletingId(null);
    }
  }

  function exportNewsletterSubscribers() {
    if (adminRole !== "owner" || newsletterSubscribers.length === 0) return;

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      ["Email", "Consent", "Subscribed at"],
      ...newsletterSubscribers.map((subscriber) => [
        subscriber.email,
        subscriber.consent ? "Yes" : "No",
        subscriber.subscribed_at
          ? new Date(subscriber.subscribed_at).toISOString()
          : "",
      ]),
    ];

    const csv = "\uFEFF" + rows.map((row) =>
      row.map(escapeCsv).join(",")
    ).join("\r\n");

    const file = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `flenzo-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function saveHomepageSection(sectionId) {
    const section = homepageSections.find((item) => item.id === sectionId);
    if (!section || homepageSavingId !== null) return;

    setHomepageSavingId(sectionId);
    setHomepageError("");
    setHomepageNotice("");

    try {
      const { data, error: queryError } = await supabase
        .from("homepage_sections")
        .update({
          content: section.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", section.id)
        .select("*")
        .single();

      if (queryError) throw queryError;

      setHomepageSections((current) =>
        current.map((item) => item.id === sectionId ? data : item)
      );
      setFloatingNotification({
        type: "success",
        message: `${formatHomepageLabel(section.section_key)} section saved successfully.`,
      });
    } catch (err) {
      setFloatingNotification({
        type: "error",
        message: err.message || "Could not save homepage content. Please try again.",
      });
    } finally {
      setHomepageSavingId(null);
    }
  }

  function startEditingStory(story) {
    setEditingStoryId(story.id);
    setStoryEditForm({
      title: story.title || "",
      label: story.label || "",
      text: story.text || "",
      sort_order: story.sort_order ?? 0,
    });
    setStoryImageFile(null);
    setStoryEditError("");
    setStoryEditNotice("");
  }

  async function saveStoryEdits(event) {
    event.preventDefault();
    if (editingStoryId == null) return;

    setStoryEditSaving(true);
    setStoryEditError("");
    setStoryEditNotice("");

    let uploadedStoryPath = null;

    try {
      const original = adminStories.find((story) => story.id === editingStoryId);
      if (!original) throw new Error("The selected story could not be found. Reload the stories.");

      const payload = {
        title: storyEditForm.title.trim(),
        label: storyEditForm.label.trim(),
        text: storyEditForm.text,
        sort_order: Number(storyEditForm.sort_order),
      };

      if (!Number.isFinite(payload.sort_order)) {
        throw new Error("Sort order must be a valid number.");
      }

      if (storyImageFile) {
        setStoryImageUploading(true);
        uploadedStoryPath = await uploadStoryImage(storyImageFile);
        payload.image_url = uploadedStoryPath;
      }

      const { data, error: updateError } = await supabase
        .from("stories")
        .update(payload)
        .eq("id", editingStoryId)
        .select("*")
        .single();

      if (updateError) throw updateError;

      setAdminStories((current) =>
        current.map((story) => story.id === data.id ? data : story)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      );

      setEditingStoryId(null);
      setStoryEditForm({});
      setStoryImageFile(null);
      setFloatingNotification({
        type: "success",
        message: `Saved changes to "${data.title || "Untitled story"}".`,
      });

      if (
        uploadedStoryPath &&
        original.image_url &&
        original.image_url.startsWith("stories/")
      ) {
        try {
          await removeStoryImage(original.image_url);
        } catch (cleanupError) {
          console.warn("New story image saved, but the previous image could not be removed.", cleanupError);
        }
      }
    } catch (err) {
      if (uploadedStoryPath) {
        try {
          await removeStoryImage(uploadedStoryPath);
        } catch (cleanupError) {
          console.warn("Could not clean up the unused uploaded story image.", cleanupError);
        }
      }
      setFloatingNotification({
        type: "error",
        message: err.message || "Could not save this story. Please try again.",
      });
    } finally {
      setStoryImageUploading(false);
      setStoryEditSaving(false);
    }
  }

  async function createStory(event) {
    event.preventDefault();
    if (createStorySaving) return;

    setCreateStorySaving(true);
    setCreateStoryError("");
    let uploadedPath = null;

    try {
      const title = createStoryForm.title.trim();
      if (!title) throw new Error("Please enter a story title.");

      const sortOrder = Number(createStoryForm.sort_order);
      if (!Number.isFinite(sortOrder)) {
        throw new Error("Sort order must be a valid number.");
      }

      const payload = {
        type: createStoryForm.type,
        title,
        label: createStoryForm.label.trim(),
        text: createStoryForm.text,
        sort_order: sortOrder,
        published: false,
      };

      if (createStoryImageFile) {
        uploadedPath = await uploadStoryImage(createStoryImageFile);
        payload.image_url = uploadedPath;
      }

      const { data, error: insertError } = await supabase
        .from("stories")
        .insert(payload)
        .select("*")
        .single();

      if (insertError) throw insertError;

      // The database row now owns the uploaded image. Do not clean it up as a failed upload.
      uploadedPath = null;

      setAdminStories((current) =>
        [...current, data].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )
      );
      setCreateStoryForm({
        type: "culture",
        title: "",
        label: "",
        text: "",
        sort_order: 0,
      });
      setCreateStoryImageFile(null);
      setShowCreateStory(false);
      setFloatingNotification({
        type: "success",
        message: `Draft "${data.title}" created successfully.`,
      });
    } catch (err) {
      if (uploadedPath) {
        try {
          await removeStoryImage(uploadedPath);
        } catch (cleanupError) {
          console.warn("Could not clean up the unused story image.", cleanupError);
        }
      }
      setCreateStoryError(
        err.message || "Could not create this story. Please try again."
      );
    } finally {
      setCreateStorySaving(false);
    }
  }

  async function toggleStoryPublished(story) {
    const storyId = story.id;
    if (storyActionBusyIdsRef.current.has(storyId)) return;

    storyActionBusyIdsRef.current.add(storyId);
    setStoryActionBusyIds([...storyActionBusyIdsRef.current]);

    try {
      const { data, error: updateError } = await supabase
        .from("stories")
        .update({ published: !story.published })
        .eq("id", storyId)
        .select("*")
        .single();

      if (updateError) throw updateError;

      setAdminStories((current) =>
        current.map((item) => item.id === data.id ? data : item)
      );
      setFloatingNotification({
        type: "success",
        message: data.published
          ? `"${data.title}" is now published.`
          : `"${data.title}" is now unpublished.`,
      });
    } catch (err) {
      setFloatingNotification({
        type: "error",
        message: err.message || "Could not change the story's publishing status.",
      });
    } finally {
      storyActionBusyIdsRef.current.delete(storyId);
      setStoryActionBusyIds([...storyActionBusyIdsRef.current]);
    }
  }

  async function deleteStory(story) {
    const storyId = story.id;
    if (storyActionBusyIdsRef.current.has(storyId)) return;

    storyActionBusyIdsRef.current.add(storyId);
    setStoryActionBusyIds([...storyActionBusyIdsRef.current]);

    try {
      const confirmed = window.confirm(
        `Delete "${story.title || "Untitled story"}"? This removes the story record and cannot be undone.`
      );
      if (!confirmed) return;

      const { error: deleteError } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (deleteError) throw deleteError;

      setAdminStories((current) =>
        current.filter((item) => item.id !== storyId)
      );
      if (editingStoryId === storyId) {
        setEditingStoryId(null);
        setStoryEditForm({});
        setStoryImageFile(null);
      }
      setFloatingNotification({
        type: "success",
        message: `Story "${story.title || "Untitled story"}" deleted.`,
      });
    } catch (err) {
      setFloatingNotification({
        type: "error",
        message: err.message || "Could not delete this story. Please try again.",
      });
    } finally {
      storyActionBusyIdsRef.current.delete(storyId);
      setStoryActionBusyIds([...storyActionBusyIdsRef.current]);
    }
  }

  useEffect(() => {
    if (status === "admin" && showProducts) {
      loadAdminProducts();
    }
  }, [status, showProducts]);

  async function deleteProduct(product) {
    if (deletingProductId) return;

    const confirmed = window.confirm(
      `Delete "${product.name || "Unnamed product"}"? This removes the product record and cannot be undone. Uploaded images will be kept.`
    );

    if (!confirmed) return;

    setDeletingProductId(product.id);

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) throw deleteError;

      setAdminProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      if (editingProductId === product.id) {
        setEditingProductId(null);
        setEditForm({});
        setEditPhotos([]);
        setEditError("");
      }

      setFloatingNotification({
        type: "success",
        message: `Product "${product.name || "Unnamed product"}" deleted.`,
      });
    } catch (err) {
      setFloatingNotification({
        type: "error",
        message: err.message || "Could not delete this product. Please try again.",
      });
    } finally {
      setDeletingProductId(null);
    }
  }

  function startEditingProduct(product) {
    setEditPhotos(photosFromProduct(product));
    setEditingProductId(product.id);
    setEditError("");
    setEditNotice("");
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      old_price: product.old_price == null ? "" : String(product.old_price),
      category_id: product.category_id || "",
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
      active: product.active === true,
      featured: product.featured === true,
    });
  }

  async function saveProduct(event) {
    event.preventDefault();
    setEditError("");
    setEditNotice("");

    const original = adminProducts.find(
      (product) => product.id === editingProductId
    );

    if (!original) {
      setEditError("The selected product could not be found. Reload the catalogue.");
      return;
    }

    const name = editForm.name.trim();
    const price = Number(editForm.price);
    const oldPriceText = String(editForm.old_price ?? "").trim();
    const oldPrice = oldPriceText === "" ? null : Number(oldPriceText);

    if (!name) {
      setEditError("Product name is required.");
      return;
    }

    if (editForm.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      setEditError("Enter a valid, non-negative selling price.");
      return;
    }

    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
      setEditError("Enter a valid previous price, or leave it blank.");
      return;
    }

    const editPhotoError = validatePhotos(editPhotos, maxPhotos);
    if (editPhotoError) {
      setEditError(editPhotoError);
      return;
    }

    const splitList = (value) =>
      String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const slugify = (value) =>
      value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const payload = {
      name,
      description: editForm.description.trim(),
      price,
      old_price: oldPrice,
      category_id: editForm.category_id || null,
      sizes: splitList(editForm.sizes),
      colors: splitList(editForm.colors),
      active: Boolean(editForm.active),
      featured: Boolean(editForm.featured),
      updated_at: new Date().toISOString(),
    };

    if (name !== (original.name || "")) {
      payload.slug = slugify(name) || original.slug;
    }

    setEditSaving(true);
    let uploadedEditPaths = [];

    try {
      // Only touch the gallery when photos were added, removed or relabelled,
      // so saving other fields never rewrites existing image data.
      const photosChanged =
        gallerySignature(editPhotos) !== gallerySignature(photosFromProduct(original));

      if (photosChanged) {
        const { images, uploadedPaths } = await uploadGallery(editPhotos);
        uploadedEditPaths = uploadedPaths;
        payload.images = images;
        payload.image_url = images[0]?.src ?? null;
      }

      const { data, error: updateError } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProductId)
        .select("*")
        .single();

      if (updateError) throw updateError;

      setAdminProducts((current) =>
        current.map((product) => product.id === data.id ? data : product)
      );
      setEditingProductId(null);
      setEditForm({});
      setEditPhotos([]);
      setFloatingNotification({
        type: "success",
        message: `Saved changes to "${data.name}".`,
      });
    } catch (err) {
      await removeUploadedFiles(uploadedEditPaths);
      setFloatingNotification({
        type: "error",
        message: err.message || "Could not save this product. Please try again.",
      });
    } finally {
      setEditSaving(false);
    }
  }

  async function createProduct(event) {
    event.preventDefault();
    setCreateError("");
    setCreateNotice("");

    const name = createForm.name.trim();
    const priceText = String(createForm.price).trim();
    const price = Number(priceText);
    const oldPriceText = String(createForm.old_price ?? "").trim();
    const oldPrice = oldPriceText === "" ? null : Number(oldPriceText);

    if (!name) {
      setCreateError("Product name is required.");
      return;
    }

    if (!createForm.category_id || !adminCategories.some(
      (category) => category.id === createForm.category_id && category.active
    )) {
      setCreateError("Choose an active product category.");
      return;
    }

    if (priceText === "" || !Number.isFinite(price) || price < 0) {
      setCreateError("Enter a valid, non-negative selling price.");
      return;
    }

    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
      setCreateError("Enter a valid previous price, or leave it blank.");
      return;
    }

    const createPhotoError = validatePhotos(createPhotos, maxPhotos);
    if (createPhotoError) {
      setCreateError(createPhotoError);
      return;
    }

    const splitList = (value) =>
      String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const slugify = (value) =>
      value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const baseSlug = slugify(name) || "product";
    const payload = {
      name,
      slug: `${baseSlug}-${Date.now().toString(36)}`,
      description: createForm.description.trim(),
      price,
      old_price: oldPrice,
      category_id: createForm.category_id,
      sizes: splitList(createForm.sizes),
      colors: splitList(createForm.colors),
      active: Boolean(createForm.active),
      featured: Boolean(createForm.featured),
    };

    setCreateSaving(true);
    let uploadedCreatePaths = [];

    try {
      if (createPhotos.length) {
        const { images, uploadedPaths } = await uploadGallery(createPhotos);
        uploadedCreatePaths = uploadedPaths;
        payload.images = images;
        payload.image_url = images[0]?.src ?? null;
      }

      const { data, error: insertError } = await supabase
        .from("products")
        .insert(payload)
        .select("*")
        .single();

      if (insertError) throw insertError;

      setAdminProducts((current) => [data, ...current]);
      setCreatePhotos([]);
      setCreateForm({
        name: "",
        description: "",
        price: "",
        old_price: "",
        category_id: "",
        sizes: "S, M, L, XL",
        colors: "Black, White",
        active: false,
        featured: false,
      });
      setShowCreateProduct(false);
      setFloatingNotification({
        type: "success",
        message: `Created "${data.name}". It has been saved to Supabase.`,
      });
    } catch (err) {
      await removeUploadedFiles(uploadedCreatePaths);
      setFloatingNotification({
        type: "error",
        message: err.message || "Could not create this product. Please try again.",
      });
    } finally {
      setCreateSaving(false);
    }
  }

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "PASSWORD_RECOVERY") {
        setError("");
        setStatus("resetPassword");
      }

      if (active && event === "SIGNED_OUT") {
        setAdminEmail("");
        setStatus("signedOut");
      }
    });

    async function restoreSession() {
      const isRecoveryLink = window.location.hash.includes("type=recovery");

      if (isRecoveryLink) {
        setStatus("resetPassword");
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!active) return;

      if (sessionError) {
        setError("Could not restore your session. Please try signing in again.");
        setStatus("error");
        return;
      }

      if (!data.session?.user) {
        setStatus("signedOut");
        return;
      }

      await verifyAdmin(data.session.user);
    }

    restoreSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      await verifyAdmin(data.user);
    } catch (err) {
      setError(err.message || "Sign-in failed. Please try again.");
      setStatus("signedOut");
    } finally {
      setBusy(false);
      setPassword("");
    }
  }

  async function handlePasswordRecovery(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setRecoverySent(false);

    try {
      const redirectTo = `${window.location.origin}/admin`;
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (recoveryError) throw recoveryError;
      setRecoverySent(true);
    } catch (err) {
      setError(err.message || "Could not send the recovery email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      await supabase.auth.signOut();
      window.history.replaceState({}, document.title, "/admin");
      setNewPassword("");
      setConfirmPassword("");
      setPassword("");
      setRecoveryMode(false);
      setRecoverySent(false);
      setError("");
      setStatus("signedOut");
    } catch (err) {
      setError(
        err.message ||
        "Could not update the password. The recovery link may have expired. Request a new one and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError("");

    const { error: logoutError } = await supabase.auth.signOut();

    setBusy(false);

    if (logoutError) {
      setError("Logout failed. Please try again.");
      return;
    }

    setAdminEmail("");
    setStatus("signedOut");
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/">FLENZO<span>.</span></a>
        <span className="admin-topbar-label">CONTENT MANAGEMENT</span>
        <a className="admin-back-link" href="/">View storefront ↗</a>
      </header>

      <main className="admin-main">
        {status === "checking" && (
          <section className="admin-panel">
            <p className="admin-eyebrow">FLENZO CMS</p>
            <h1>Checking access</h1>
            <p>Please wait while we verify your session.</p>
          </section>
        )}

        {status === "resetPassword" && (
          <section className="admin-panel">
            <p className="admin-eyebrow">ACCOUNT RECOVERY</p>
            <h1>Choose a new password</h1>
            <p>Set a new password for your Flenzo administrator account.</p>

            <form className="admin-form" onSubmit={handlePasswordUpdate}>
              <label htmlFor="new-admin-password">New password</label>
              <input
                id="new-admin-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
              />

              <label htmlFor="confirm-admin-password">Confirm new password</label>
              <input
                id="confirm-admin-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter the new password again"
                minLength={8}
                required
              />

              {error && <p className="admin-error" role="alert">{error}</p>}

              <button className="admin-submit" type="submit" disabled={busy}>
                {busy ? "UPDATING PASSWORD..." : "SAVE NEW PASSWORD"}
              </button>
            </form>
          </section>
        )}

        {status === "signedOut" && (
          <section className="admin-panel">


            <p className="admin-eyebrow">PRIVATE WORKSPACE</p>
            <h1>{recoveryMode ? "Reset your password" : "Admin sign in"}</h1>
            <p>
              {recoveryMode
                ? "Enter the email address associated with your Flenzo administrator account. We'll send a recovery link if the account can receive recovery email."
                : "Sign in with your authorized Flenzo administrator account."}
            </p>

            {recoveryMode ? (
              <form className="admin-form" onSubmit={handlePasswordRecovery}>
                <label htmlFor="admin-email">Email address</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />

                {error && <p className="admin-error" role="alert">{error}</p>}
                {recoverySent && (
                  <p className="admin-success" role="status">
                    If the address is registered and email recovery is configured,
                    a recovery link should arrive shortly. Check your inbox and spam folder.
                  </p>
                )}

                <button className="admin-submit" type="submit" disabled={busy}>
                  {busy ? "SENDING..." : "SEND RECOVERY LINK"}
                </button>
                <button
                  className="admin-logout"
                  type="button"
                  onClick={() => {
                    setRecoveryMode(false);
                    setRecoverySent(false);
                    setError("");
                  }}
                >
                  BACK TO SIGN IN
                </button>
              </form>
            ) : (
              <form className="admin-form" onSubmit={handleLogin}>
                <label htmlFor="admin-email">Email address</label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />

                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  required
                />

                {error && <p className="admin-error" role="alert">{error}</p>}

                <button className="admin-submit" type="submit" disabled={busy}>
                  {busy ? "VERIFYING..." : "SIGN IN"}
                </button>
                <button
                  className="admin-forgot"
                  type="button"
                  onClick={() => {
                    setRecoveryMode(true);
                    setRecoverySent(false);
                    setError("");
                  }}
                >
                  Forgot password?
                </button>
              </form>
            )}
            <p className="admin-footnote">
              Access is checked against the Flenzo admin database.
            </p>
          </section>
        )}

        {status === "admin" && (
          <section className="admin-panel admin-dashboard">
          {floatingNotification && (
            <div
              className={`admin-floating-notification is-${floatingNotification.type}`}
              role={floatingNotification.type === "error" ? "alert" : "status"}
              aria-live={floatingNotification.type === "error" ? "assertive" : "polite"}
            >
              <span className="admin-floating-notification-icon" aria-hidden="true">
                {floatingNotification.type === "error" ? "!" : "✓"}
              </span>
              <p>{floatingNotification.message}</p>
              <button
                type="button"
                className="admin-floating-notification-close"
                aria-label="Dismiss notification"
                onClick={() => setFloatingNotification(null)}
              >
                ×
              </button>
            </div>
          )}
            <nav className="admin-studio-nav" aria-label="Studio navigation">
              <p className="admin-studio-nav-label">STUDIO</p>
              {adminRole === "owner" && (
                <button type="button" className={activeStudioSection === "overview" ? "is-active" : ""} onClick={() => {
                setActiveStudioSection("overview");
                setShowCategories(false);
                setShowProducts(false);
                setShowStories(false);
                setShowHomepage(false);
              }}><span aria-hidden="true">⌂</span> Overview</button>
              )}
              <button type="button" className={activeStudioSection === "products" ? "is-active" : ""} onClick={() => {
                setActiveStudioSection("products");
                setShowCategories(false);
                setShowProducts(true);
                setShowStories(false);
                setShowHomepage(false);
              }}><span aria-hidden="true">▦</span> Products</button>
              <button type="button" className={activeStudioSection === "categories" ? "is-active" : ""} onClick={() => {
                setActiveStudioSection("categories");
                setShowProducts(false);
                setShowCategories(true);
                setShowStories(false);
                setShowHomepage(false);
                loadAdminCategories();
              }}><span aria-hidden="true">▧</span> Categories</button>
              {adminRole === "owner" && (
                <button type="button" className={activeStudioSection === "stories" ? "is-active" : ""} onClick={() => {
                setActiveStudioSection("stories");
                setShowCategories(false);
                setShowProducts(false);
                setShowStories(true);
                setShowHomepage(false);
                loadAdminStories();
              }}><span aria-hidden="true">▤</span> Stories</button>
              )}
              {adminRole === "owner" && (
              <button type="button" className={activeStudioSection === "homepage" ? "is-active" : ""} onClick={() => {
                setActiveStudioSection("homepage");
                setShowCategories(false);
                setShowProducts(false);
                setShowStories(false);
                setShowHomepage(true);
                loadAdminHomepage();
              }}><span aria-hidden="true">▧</span> Homepage</button>
              )}
              {adminRole === "owner" && (
                <button
                  type="button"
                  className={activeStudioSection === "newsletter" ? "is-active" : ""}
                  onClick={() => {
                    setActiveStudioSection("newsletter");
                    setShowCategories(false);
                    setShowProducts(false);
                    setShowStories(false);
                    setShowHomepage(false);
                    loadNewsletterSubscribers();
                  }}
                >
                  <span aria-hidden="true">✉</span> Newsletter
                </button>
              )}
              {adminRole === "owner" && (
                <>
              <div className="admin-studio-nav-divider"></div>
              <p className="admin-studio-nav-label">PLANNED</p>
              <span className="admin-studio-nav-planned">Pages</span>
              <span className="admin-studio-nav-planned">Media library</span>
              <span className="admin-studio-nav-planned">Design system</span>
              <span className="admin-studio-nav-planned">SEO &amp; discovery</span>
              <span className="admin-studio-nav-planned">Settings</span>
                </>
              )}
            </nav>

            {adminRole === "owner" && activeStudioSection === "overview" && (
              <>
            <p className="admin-eyebrow">PRIVATE WORKSPACE</p>
            <h1>Flenzo CMS</h1>
            <p>You are signed in and your administrator record is verified.</p>

            <div className="admin-welcome">
              <span className="admin-status-dot" />
              <div>
                <strong>Administrator access verified</strong>
                <p>{adminEmail}</p>
              </div>
            </div>

              </>
            )}

            {showProducts && (
              <section className="admin-products">
                <h2>Product catalogue</h2>
                <p>Create products and manage existing records stored in Supabase.</p>

                {createNotice && <p className="admin-success" role="status">{createNotice}</p>}

                <button
                  className="admin-edit-button"
                  type="button"
                  onClick={() => {
                    setShowCreateProduct((current) => !current);
                    setCreateError("");
                  }}
                >
                  {showCreateProduct ? "CANCEL NEW PRODUCT" : "+ CREATE PRODUCT"}
                </button>

                {showCreateProduct && (
                  <form className="admin-product-editor" onSubmit={createProduct}>
                    <h3>Create product</h3>
                    <p>Enter the product details and optionally select photos. Products start inactive until you choose to publish them.</p>

                    <label htmlFor="create-image">Product photos (optional)</label>
                    <ProductImagePicker
                      inputId="create-image"
                      photos={createPhotos}
                      onChange={setCreatePhotos}
                      maxPhotos={maxPhotos}
                      disabled={createSaving}
                    />

                    <label htmlFor="create-name">Product name</label>
                    <input
                      id="create-name"
                      value={createForm.name}
                      onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />

                    <label htmlFor="create-description">Description</label>
                    <textarea
                      id="create-description"
                      rows={4}
                      value={createForm.description}
                      onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                    />

                    <div className="admin-editor-grid">
                      <div>
                        <label htmlFor="create-price">Selling price (KSh)</label>
                        <input
                          id="create-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={createForm.price}
                          onChange={(event) => setCreateForm((current) => ({ ...current, price: event.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="create-old-price">Previous price (KSh)</label>
                        <input
                          id="create-old-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={createForm.old_price}
                          onChange={(event) => setCreateForm((current) => ({ ...current, old_price: event.target.value }))}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <label htmlFor="create-category">Category</label>
                    <select
                      id="create-category"
                      value={createForm.category_id}
                      onChange={(event) => setCreateForm((current) => ({ ...current, category_id: event.target.value }))}
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      {adminCategories.filter((category) => category.active).map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>

                    <label htmlFor="create-sizes">Sizes</label>
                    <input
                      id="create-sizes"
                      value={createForm.sizes}
                      onChange={(event) => setCreateForm((current) => ({ ...current, sizes: event.target.value }))}
                      placeholder="S, M, L, XL"
                    />
                    <p className="admin-editor-hint">Separate values with commas.</p>

                    <label htmlFor="create-colors">Colours</label>
                    <input
                      id="create-colors"
                      value={createForm.colors}
                      onChange={(event) => setCreateForm((current) => ({ ...current, colors: event.target.value }))}
                      placeholder="Black, White"
                    />
                    <p className="admin-editor-hint">Separate values with commas.</p>

                    <label className="admin-check-row">
                      <input
                        type="checkbox"
                        checked={createForm.active}
                        onChange={(event) => setCreateForm((current) => ({ ...current, active: event.target.checked }))}
                      />
                      Product is active and can appear in the shop
                    </label>

                    <label className="admin-check-row">
                      <input
                        type="checkbox"
                        checked={createForm.featured}
                        onChange={(event) => setCreateForm((current) => ({ ...current, featured: event.target.checked }))}
                      />
                      Featured product
                    </label>

                    {createError && <p className="admin-error" role="alert">{createError}</p>}

                    <div className="admin-editor-actions">
                      <button className="admin-submit" type="submit" disabled={createSaving}>
                        {createSaving ? "CREATING..." : "CREATE PRODUCT"}
                      </button>
                      <button
                        className="admin-logout"
                        type="button"
                        disabled={createSaving}
                        onClick={() => {
                          setShowCreateProduct(false);
                          setCreateError("");
                        }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                )}

                {editNotice && <p className="admin-success" role="status">{editNotice}</p>}
                {productsLoading && <p>Loading products...</p>}

                {productsError && (
                  <div>
                    <p className="admin-error" role="alert">{productsError}</p>
                    <button
                      className="admin-logout"
                      type="button"
                      onClick={loadAdminProducts}
                      disabled={productsLoading}
                    >
                      TRY AGAIN
                    </button>
                  </div>
                )}

                {!productsLoading && !productsError && adminProducts.length === 0 && (
                  <p>No product records were returned from Supabase.</p>
                )}

                {!productsLoading && !productsError && adminProducts.length > 0 && (
                  <>
                    <p>{adminProducts.length} product record(s) found.</p>
                    <div className="admin-product-list">
                      {adminProducts.map((product) => (
                        <React.Fragment key={product.id}>
                          <article className="admin-product-row">
                            <div className="admin-product-image">
                              {(() => {
                                const images = Array.isArray(product.images) ? product.images : [];
                                const firstImage = images[0];
                                const imagePath = typeof firstImage === "string"
                                  ? firstImage
                                  : firstImage?.src || product.image_url || "";

                                const imageUrl = resolveImageSrc(imagePath);

                                return imageUrl
                                  ? <img src={imageUrl} alt={product.name || "Product"} loading="lazy" />
                                  : <span>No image</span>;
                              })()}
                            </div>
                            <div className="admin-product-info">
                              <strong>{product.name || "Unnamed product"}</strong>
                              <span>
                                KSh {Number(product.price || 0).toLocaleString()}
                              </span>
                              <small>
                                Category: {adminCategories.find((category) => category.id === product.category_id)?.name || product.category || "Not specified"}
                              </small>
                              <small>
                                Status: {product.active === true ? "Active" : product.active === false ? "Inactive" : "Not specified"}
                              </small>
                              <small>
                                ID: {String(product.id)}
                              </small>
                              <div className="admin-product-actions">
                                <button
                                  className="admin-edit-button"
                                  type="button"
                                  onClick={() => startEditingProduct(product)}
                                  disabled={deletingProductId === product.id}
                                >
                                  {editingProductId === product.id ? "EDITING..." : "EDIT PRODUCT"}
                                </button>
                                <button
                                  className="admin-product-delete"
                                  type="button"
                                  onClick={() => deleteProduct(product)}
                                  disabled={Boolean(deletingProductId) || editSaving}
                                >
                                  {deletingProductId === product.id ? "DELETING..." : "DELETE PRODUCT"}
                                </button>
                              </div>
                            </div>
                          </article>

                          {editingProductId === product.id && (
                            <form className="admin-product-editor" onSubmit={saveProduct}>
                              <h3>Edit product</h3>
                              <p>Changes are saved to the live product record. Existing photos are kept unless you remove them.</p>

                              <label htmlFor={`edit-image-${product.id}`}>Product photos</label>
                              <ProductImagePicker
                                inputId={`edit-image-${product.id}`}
                                photos={editPhotos}
                                onChange={setEditPhotos}
                                maxPhotos={maxPhotos}
                                disabled={editSaving}
                              />

                              <label htmlFor={`edit-name-${product.id}`}>Product name</label>
                              <input
                                id={`edit-name-${product.id}`}
                                name="name"
                                value={editForm.name || ""}
                                onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                                required
                              />

                              <label htmlFor={`edit-description-${product.id}`}>Description</label>
                              <textarea
                                id={`edit-description-${product.id}`}
                                name="description"
                                rows={4}
                                value={editForm.description || ""}
                                onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                              />

                              <div className="admin-editor-grid">
                                <div>
                                  <label htmlFor={`edit-price-${product.id}`}>Selling price (KSh)</label>
                                  <input
                                    id={`edit-price-${product.id}`}
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.price ?? ""}
                                    onChange={(event) => setEditForm((current) => ({ ...current, price: event.target.value }))}
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`edit-old-price-${product.id}`}>Previous price (KSh)</label>
                                  <input
                                    id={`edit-old-price-${product.id}`}
                                    name="old_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.old_price ?? ""}
                                    onChange={(event) => setEditForm((current) => ({ ...current, old_price: event.target.value }))}
                                    placeholder="Optional"
                                  />
                                </div>
                              </div>

                              <label htmlFor={`edit-category-${product.id}`}>Category</label>
                              <select
                                id={`edit-category-${product.id}`}
                                name="category_id"
                                value={editForm.category_id || ""}
                                onChange={(event) => setEditForm((current) => ({ ...current, category_id: event.target.value }))}
                              >
                                <option value="">No category</option>
                                {adminCategories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}{category.active ? "" : " (inactive)"}
                                  </option>
                                ))}
                              </select>

                              <label htmlFor={`edit-sizes-${product.id}`}>Sizes</label>
                              <input
                                id={`edit-sizes-${product.id}`}
                                name="sizes"
                                value={editForm.sizes || ""}
                                onChange={(event) => setEditForm((current) => ({ ...current, sizes: event.target.value }))}
                                placeholder="S, M, L, XL"
                              />
                              <p className="admin-editor-hint">Separate values with commas.</p>

                              <label htmlFor={`edit-colors-${product.id}`}>Colours</label>
                              <input
                                id={`edit-colors-${product.id}`}
                                name="colors"
                                value={editForm.colors || ""}
                                onChange={(event) => setEditForm((current) => ({ ...current, colors: event.target.value }))}
                                placeholder="Black, White"
                              />
                              <p className="admin-editor-hint">Separate values with commas.</p>

                              <label className="admin-check-row">
                                <input
                                  type="checkbox"
                                  checked={Boolean(editForm.active)}
                                  onChange={(event) => setEditForm((current) => ({ ...current, active: event.target.checked }))}
                                />
                                Product is active and can appear in the shop
                              </label>

                              <label className="admin-check-row">
                                <input
                                  type="checkbox"
                                  checked={Boolean(editForm.featured)}
                                  onChange={(event) => setEditForm((current) => ({ ...current, featured: event.target.checked }))}
                                />
                                Featured product
                              </label>

                              {editError && <p className="admin-error" role="alert">{editError}</p>}

                              <div className="admin-editor-actions">
                                <button className="admin-submit" type="submit" disabled={editSaving}>
                                  {editSaving ? "SAVING..." : "SAVE CHANGES"}
                                </button>
                                <button
                                  className="admin-logout"
                                  type="button"
                                  disabled={editSaving}
                                  onClick={() => {
                                    setEditingProductId(null);
                                    setEditForm({});
                                    setEditError("");
                                  }}
                                >
                                  CANCEL
                                </button>
                              </div>
                            </form>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {showCategories && (
              <section className="admin-products admin-category-manager">
                <h2>Product categories</h2>
                <p>Organise the shop catalogue. Categories can be renamed, reordered, or temporarily deactivated.</p>

                <form
                  className="admin-category-create"
                  onSubmit={createCategory}
                >
                  <label htmlFor="new-category-name">New category name</label>
                  <div className="admin-category-create-row">
                    <input
                      id="new-category-name"
                      value={categoryName}
                      onChange={(event) => setCategoryName(event.target.value)}
                      placeholder="e.g. Accessories"
                      maxLength={60}
                      required
                      disabled={categorySaving}
                    />
                    <button
                      className="admin-submit"
                      type="submit"
                      disabled={categorySaving}
                    >
                      {categorySaving ? "CREATING..." : "ADD CATEGORY"}
                    </button>
                  </div>
                </form>

                {categoriesError && (
                  <p className="admin-error" role="alert">{categoriesError}</p>
                )}

                <div className="admin-category-list-heading">
                  <h3>Existing categories</h3>
                  <span>{adminCategories.length} total</span>
                </div>

                {categoriesLoading ? (
                  <p>Loading categories...</p>
                ) : adminCategories.length === 0 ? (
                  <p>No categories yet. Create your first category above.</p>
                ) : (
                  <div className="admin-category-list">
                    {[...adminCategories]
                      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
                      .map((category, index, orderedCategories) => {
                        const busy = categoryActionBusyId === category.id;
                        const editing = editingCategoryId === category.id;

                        return (
                          <div className="admin-category-row" key={category.id}>
                            <div className="admin-category-details">
                              {editing ? (
                                <input
                                  aria-label={`Rename ${category.name}`}
                                  value={editingCategoryName}
                                  onChange={(event) => setEditingCategoryName(event.target.value)}
                                  maxLength={60}
                                  disabled={busy}
                                  autoFocus
                                />
                              ) : (
                                <strong>{category.name}</strong>
                              )}
                              <span className="admin-category-slug">{category.slug}</span>
                              <span className={category.active ? "admin-category-status is-active" : "admin-category-status"}>
                                {category.active ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </div>

                            <div className="admin-category-actions">
                              <button
                                type="button"
                                className="admin-edit-button"
                                onClick={() => moveCategory(category.id, -1)}
                                disabled={busy || categoriesLoading || index === 0}
                                aria-label={`Move ${category.name} up`}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="admin-edit-button"
                                onClick={() => moveCategory(category.id, 1)}
                                disabled={busy || categoriesLoading || index === orderedCategories.length - 1}
                                aria-label={`Move ${category.name} down`}
                              >
                                ↓
                              </button>

                              {editing ? (
                                <>
                                  <button
                                    type="button"
                                    className="admin-edit-button"
                                    onClick={() => saveCategoryName(category.id)}
                                    disabled={busy || !editingCategoryName.trim()}
                                  >
                                    {busy ? "SAVING..." : "SAVE"}
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-logout"
                                    onClick={() => {
                                      setEditingCategoryId(null);
                                      setEditingCategoryName("");
                                      setCategoriesError("");
                                    }}
                                    disabled={busy}
                                  >
                                    CANCEL
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="admin-edit-button"
                                  onClick={() => {
                                    setEditingCategoryId(category.id);
                                    setEditingCategoryName(category.name);
                                    setCategoriesError("");
                                  }}
                                  disabled={busy}
                                >
                                  RENAME
                                </button>
                              )}

                              <button
                                type="button"
                                className="admin-logout"
                                onClick={() => toggleCategory(category)}
                                disabled={busy || editing}
                              >
                                {busy ? "PLEASE WAIT..." : category.active ? "DEACTIVATE" : "ACTIVATE"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                <button
                  type="button"
                  className="admin-edit-button"
                  onClick={loadAdminCategories}
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? "REFRESHING..." : "REFRESH CATEGORIES"}
                </button>
              </section>
            )}

            {adminRole === "owner" && showStories && (
              <section className="admin-products">
                <h2>Culture & community stories</h2>
                <p>Create stories, edit their content, control publishing, and remove outdated stories.</p>

                <button
                  className="admin-edit-button"
                  type="button"
                  onClick={() => {
                    setShowCreateStory((current) => !current);
                    setCreateStoryError("");
                  }}
                >
                  {showCreateStory ? "CANCEL NEW STORY" : "CREATE STORY"}
                </button>

                {showCreateStory && (
                  <form className="admin-story-edit-form" onSubmit={createStory}>
                    <h3>New story draft</h3>
                    <p>New stories are saved as unpublished drafts.</p>

                    <label>
                      Section
                      <select
                        value={createStoryForm.type}
                        onChange={(event) => setCreateStoryForm((current) => ({ ...current, type: event.target.value }))}
                      >
                        <option value="culture">Culture</option>
                        <option value="community">Community</option>
                      </select>
                    </label>

                    <label>
                      Title
                      <input
                        value={createStoryForm.title}
                        onChange={(event) => setCreateStoryForm((current) => ({ ...current, title: event.target.value }))}
                        required
                      />
                    </label>

                    <label>
                      Label
                      <input
                        value={createStoryForm.label}
                        onChange={(event) => setCreateStoryForm((current) => ({ ...current, label: event.target.value }))}
                      />
                    </label>

                    <label>
                      Story text
                      <textarea
                        rows={5}
                        value={createStoryForm.text}
                        onChange={(event) => setCreateStoryForm((current) => ({ ...current, text: event.target.value }))}
                      />
                    </label>

                    <label>
                      Sort order
                      <input
                        type="number"
                        step="1"
                        value={createStoryForm.sort_order}
                        onChange={(event) => setCreateStoryForm((current) => ({ ...current, sort_order: event.target.value }))}
                        required
                      />
                    </label>

                    <label>
                      Story image (optional, original file up to 15 MB; optimized automatically)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setCreateStoryImageFile(event.target.files?.[0] || null)}
                      />
                    </label>

                    {createStoryImageFile && (
                      <p role="status">Selected image: {createStoryImageFile.name}</p>
                    )}

                    {createStoryError && (
                      <p className="admin-error" role="alert">{createStoryError}</p>
                    )}

                    <button className="admin-submit" type="submit" disabled={createStorySaving}>
                      {createStorySaving ? "CREATING..." : "CREATE DRAFT"}
                    </button>
                  </form>
                )}

                {storiesLoading && <p role="status">Loading stories...</p>}

                {storiesError && (
                  <div>
                    <p className="admin-error" role="alert">{storiesError}</p>
                    <button
                      className="admin-logout"
                      type="button"
                      onClick={loadAdminStories}
                      disabled={storiesLoading}
                    >
                      TRY AGAIN
                    </button>
                  </div>
                )}

                {storyEditNotice && (
                  <p className="admin-success" role="status">{storyEditNotice}</p>
                )}

                {!storiesLoading && !storiesError && adminStories.length === 0 && (
                  <p>No stories were found in the Stories table.</p>
                )}

                {!storiesLoading && !storiesError && ["culture", "community"].map((type) => {
                  const stories = adminStories.filter((story) => story.type === type);

                  return (
                    <div key={type} className="admin-story-group">
                      <h3>{type === "culture" ? "Culture" : "Community"}</h3>
                      {stories.length === 0 ? (
                        <p>No {type} stories found.</p>
                      ) : (
                        <div className="admin-story-list">
                          {stories.map((story) => (
                            <article className="admin-story-row" key={story.id}>
                              {story.image_url ? (
                                <img
                                  className="admin-story-image"
                                  src={story.image_url.startsWith("/flenzo/") || /^https?:\/\//i.test(story.image_url)
                                    ? story.image_url
                                    : supabase.storage.from("flenzo-images").getPublicUrl(story.image_url.replace(/^\/+/, "")).data.publicUrl}
                                  alt=""
                                  loading="lazy"
                                />
                              ) : (
                                <div className="admin-story-image admin-story-image-empty">No image</div>
                              )}
                              <div className="admin-story-details">
                                <strong>{story.title || "Untitled story"}</strong>
                                <p>{story.label || "No label"}</p>
                                <p>Type: {story.type} · Sort order: {story.sort_order ?? "Not set"}</p>
                                <span className={story.published ? "admin-story-status is-published" : "admin-story-status"}>
                                  {story.published ? "PUBLISHED" : "UNPUBLISHED"}
                                </span>

                                <div className="admin-story-actions">
                                  <button
                                    className="admin-edit-button"
                                    type="button"
                                    disabled={storyActionBusyIds.includes(story.id)}
                                    onClick={() => toggleStoryPublished(story)}
                                  >
                                    {storyActionBusyIds.includes(story.id)
                                      ? story.published ? "UNPUBLISHING..." : "PUBLISHING..."
                                      : story.published ? "UNPUBLISH" : "PUBLISH"}
                                  </button>
                                  <button
                                    className="admin-edit-button admin-story-delete-button"
                                    type="button"
                                    disabled={storyActionBusyIds.includes(story.id)}
                                    onClick={() => deleteStory(story)}
                                  >
                                    {storyActionBusyIds.includes(story.id) ? "DELETING..." : "DELETE STORY"}
                                  </button>
                                </div>

                                <button
                                  className="admin-edit-button"
                                  type="button"
                                  onClick={() => {
                                    if (editingStoryId === story.id) {
                                      setEditingStoryId(null);
                                      setStoryEditForm({});
                                      setStoryEditError("");
                                    } else {
                                      startEditingStory(story);
                                    }
                                  }}
                                >
                                  {editingStoryId === story.id ? "CANCEL EDIT" : "EDIT STORY"}
                                </button>

                                {editingStoryId === story.id && (
                                  <form className="admin-story-edit-form" onSubmit={saveStoryEdits}>
                                    <label>
                                      Title
                                      <input
                                        value={storyEditForm.title}
                                        onChange={(event) => setStoryEditForm((current) => ({ ...current, title: event.target.value }))}
                                        required
                                      />
                                    </label>

                                    <label>
                                      Label
                                      <input
                                        value={storyEditForm.label}
                                        onChange={(event) => setStoryEditForm((current) => ({ ...current, label: event.target.value }))}
                                      />
                                    </label>

                                    <label>
                                      Story text
                                      <textarea
                                        rows={5}
                                        value={storyEditForm.text}
                                        onChange={(event) => setStoryEditForm((current) => ({ ...current, text: event.target.value }))}
                                      />
                                    </label>

                                    <label>
                                      Sort order
                                      <input
                                        type="number"
                                        step="1"
                                        value={storyEditForm.sort_order}
                                        onChange={(event) => setStoryEditForm((current) => ({ ...current, sort_order: event.target.value }))}
                                        required
                                      />
                                    </label>

                                    <label>
                                      Replace story image (optional, original file up to 15 MB; supported images are optimized automatically)
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                          const file = event.target.files?.[0] || null;
                                          setStoryImageFile(file);
                                        }}
                                      />
                                    </label>

                                    {storyImageFile && (
                                      <p role="status">Selected image: {storyImageFile.name}</p>
                                    )}

                                    {storyEditError && <p className="admin-error" role="alert">{storyEditError}</p>}

                                    <button className="admin-submit" type="submit" disabled={storyEditSaving}>
                                      {storyEditSaving ? "SAVING..." : "SAVE STORY"}
                                    </button>
                                  </form>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            )}



            {adminRole === "owner" && showHomepage && (
              <section className="admin-homepage-editor">
                <div className="admin-homepage-heading">
                  <div>
                    <h2>Homepage editor</h2>
                    <p>
                      Choose a section, edit the labeled fields, check the text
                      preview, then save your changes.
                    </p>
                  </div>
                  <button
                    className="admin-edit-button"
                    type="button"
                    onClick={loadAdminHomepage}
                    disabled={homepageLoading || homepageSavingId !== null}
                  >
                    {homepageLoading ? "LOADING..." : "RELOAD CONTENT"}
                  </button>
                </div>

                {homepageNotice && (
                  <p className="admin-success" role="status">{homepageNotice}</p>
                )}
                {homepageError && (
                  <p className="admin-error" role="alert">{homepageError}</p>
                )}

                {homepageLoading ? (
                  <p>Loading homepage content from Supabase...</p>
                ) : homepageSections.length === 0 ? (
                  !homepageError && <p>No homepage sections were returned.</p>
                ) : (
                  <div className="admin-homepage-sections">
                    {homepageSections.map((section) => (
                      <details className="admin-homepage-section" key={section.id}>
                        <summary>
                          <span>{formatHomepageLabel(section.section_key)}</span>
                          <small>EDIT SECTION</small>
                        </summary>
                        <div className="admin-homepage-section-body">
                          <div className="admin-homepage-two-column">
                            <form
                              className="admin-homepage-form"
                              onSubmit={(event) => {
                                event.preventDefault();
                                saveHomepageSection(section.id);
                              }}
                            >
                              <HomepageSectionEditor
                                section={section}
                                disabled={homepageSavingId !== null}
                                onChange={(nextContent) => {
                                  setHomepageSections((current) =>
                                    current.map((item) =>
                                      item.id === section.id
                                        ? { ...item, content: nextContent }
                                        : item
                                    )
                                  );
                                  setHomepageNotice("");
                                }}
                              />
                              <div className="admin-homepage-actions">
                                <button
                                  className="admin-submit"
                                  type="submit"
                                  disabled={homepageSavingId !== null || homepageLoading}
                                >
                                  {homepageSavingId === section.id
                                    ? "SAVING..."
                                    : "SAVE CHANGES"}
                                </button>
                              </div>
                            </form>
                            <HomepageLivePreview section={section} />
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </section>
            )}

            {adminRole === "owner" && activeStudioSection === "newsletter" && (
              <section className="admin-newsletter-manager">
                <div className="admin-newsletter-heading">
                  <div>
                    <h2>Newsletter subscribers</h2>
                    <p>Manage the people who have signed up for Flenzo updates.</p>
                  </div>
                  <div className="admin-newsletter-actions">
                    <button
                      className="admin-edit-button"
                      type="button"
                      onClick={loadNewsletterSubscribers}
                      disabled={newsletterLoading}
                    >
                      {newsletterLoading ? "LOADING..." : "RELOAD"}
                    </button>
                    <button
                      className="admin-submit"
                      type="button"
                      onClick={exportNewsletterSubscribers}
                      disabled={newsletterSubscribers.length === 0}
                    >
                      EXPORT CSV
                    </button>
                  </div>
                </div>

                <div className="admin-newsletter-count">
                  <strong>{newsletterSubscribers.length}</strong>
                  <span>
                    {newsletterSubscribers.length === 1 ? "subscriber" : "subscribers"}
                  </span>
                </div>

                <label className="admin-newsletter-search">
                  <span>SEARCH SUBSCRIBERS</span>
                  <input
                    type="search"
                    value={newsletterSearch}
                    onChange={(event) => setNewsletterSearch(event.target.value)}
                    placeholder="Search by email address..."
                  />
                </label>

                {newsletterError && (
                  <p className="admin-error" role="alert">{newsletterError}</p>
                )}

                {newsletterLoading ? (
                  <p>Loading subscribers from Supabase...</p>
                ) : newsletterSubscribers.length === 0 ? (
                  <div className="admin-newsletter-empty">
                    <h3>No subscribers yet</h3>
                    <p>New signups from the public website will appear here.</p>
                  </div>
                ) : (
                  (() => {
                    const filteredSubscribers = newsletterSubscribers.filter((subscriber) =>
                      subscriber.email.toLowerCase().includes(newsletterSearch.trim().toLowerCase())
                    );

                    return filteredSubscribers.length === 0 ? (
                      <div className="admin-newsletter-empty">
                        <p>No subscribers match that email search.</p>
                      </div>
                    ) : (
                      <div className="admin-newsletter-list">
                        {filteredSubscribers.map((subscriber) => (
                          <article className="admin-newsletter-row" key={subscriber.id}>
                            <div className="admin-newsletter-info">
                              <strong>{subscriber.email}</strong>
                              <span>
                                Signed up: {subscriber.subscribed_at
                                  ? new Date(subscriber.subscribed_at).toLocaleString("en-KE", {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })
                                  : "Date unavailable"}
                              </span>
                              <small>
                                Consent: {subscriber.consent ? "Yes" : "No"}
                              </small>
                            </div>
                            <button
                              className="admin-newsletter-remove"
                              type="button"
                              onClick={() => deleteNewsletterSubscriber(subscriber)}
                              disabled={newsletterDeletingId !== null}
                            >
                              {newsletterDeletingId === subscriber.id
                                ? "REMOVING..."
                                : "REMOVE"}
                            </button>
                          </article>
                        ))}
                      </div>
                    );
                  })()
                )}
              </section>
            )}

            <button
              className="admin-logout"
              onClick={handleLogout}
              disabled={busy}
            >
              {busy ? "SIGNING OUT..." : "SIGN OUT"}
            </button>
            {error && <p className="admin-error" role="alert">{error}</p>}
          </section>
        )}

        {status === "denied" && (
          <section className="admin-panel">
            <p className="admin-eyebrow">ACCESS RESTRICTED</p>
            <h1>Admin access required</h1>
            <p>
              The account {adminEmail} is signed in, but it does not have an
              administrator record for Flenzo.
            </p>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-submit" onClick={handleLogout} disabled={busy}>
              {busy ? "SIGNING OUT..." : "SIGN OUT"}
            </button>
          </section>
        )}

        {status === "error" && (
          <section className="admin-panel">
            <p className="admin-eyebrow">VERIFICATION ERROR</p>
            <h1>We couldn't verify access</h1>
            <p>{error}</p>
            <button
              className="admin-submit"
              onClick={() => window.location.reload()}
            >
              TRY AGAIN
            </button>
            <button className="admin-logout" onClick={handleLogout} disabled={busy}>
              SIGN OUT
            </button>
          </section>
        )}
      </main>

      <footer className="admin-footer">FLENZO CULTURE · ADMIN WORKSPACE</footer>
    </div>
  );
}

export default function AdminApp() {
  if (!supabaseConfigured) {
    return (
      <div className="admin-shell">
        <header className="admin-topbar">
          <a className="admin-brand" href="/">FLENZO<span>.</span></a>
          <span className="admin-topbar-label">CONTENT MANAGEMENT</span>
          <a className="admin-back-link" href="/">View storefront ↗</a>
        </header>

        <main className="admin-main">
          <section className="admin-panel">
            <p className="admin-eyebrow">FLENZO CMS</p>
            <h1>Admin temporarily unavailable</h1>
            <p>The content service is not available right now. Please try again shortly.</p>
          </section>
        </main>

        <footer className="admin-footer">FLENZO CULTURE · ADMIN WORKSPACE</footer>
      </div>
    );
  }

  return <AdminAppInner />;
}
