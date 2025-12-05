"use client"
import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Brand, Category, CategoryAttribute, FeatureKey } from "@/lib/types/types";
import { PaginationRequest, IdParam } from "@/lib/types/types";
import { addProduct } from "@/lib/api/products/useAdd";
import { getBrands } from "@/lib/api/brands/useGets";
import { GetCategories } from "@/lib/api/categories/useGets";
import { getCategoryAttributes } from "@/lib/api/attributes/useGetsCats";
import Input from "@/features/components/input";
import Button from "@/features/components/button";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });
import { 
  ImagePlus, 
  FileImage, 
  BadgeCheck, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  X,
  CheckCircle2,
  Loader2,
  Package,
  Tag,
  DollarSign,
  Box,
  Sparkles,
  Plus,
  Trash2,
  Settings
} from "lucide-react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";

type FormData = {
  name: string,
  description: string,
  price: number | null,
  stock: number,
  brand: { value: number; label: string } | null;
  category: { value: number; label: string } | null;
  files: File[];
  features?: {
    key: {
      label: string,
      value: number
    };
    value: string;
  }[]
}

export default function NewProductPage() {

  const router = useRouter();

  useEffect(() => {
    // localStorage'dan user bilgisi al
    const user = localStorage.getItem("user"); // veya kullandığınız key
    if (!user) {
      router.push("/login"); // user yoksa login sayfasına yönlendir
    }
  }, [router]);

  const [result, setResult] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      price: null,
      stock: 1,
      brand: null,
      category: null,
      files: [],
      features: [{ key: {label: "", value: 0}, value: "" }]
    },
  });

  const { register, handleSubmit, setValue, control, watch, formState: { errors } } = methods;
  const files = watch("files");

  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchBrands, setSearchBrands] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchCategories, setSearchCategories] = useState("");
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([])
  const category = watch("category")
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchAttributes = async () => {
        if (!category) return;
        const request: IdParam = {
          id: category?.value || 0
        }
        try {
          const data = await getCategoryAttributes(request)
          setAttributes(data.data.category_attributes)

        } catch (err) {
          console.error(err)
          setAttributes([]);
        }
      };
      fetchAttributes();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [category]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchBrands = async () => {
        const request: PaginationRequest = { search: searchBrands };
        try {
          const data = await getBrands(request);
          setBrands(data.data.brands);
        } catch (err) {
          console.error(err);
          setBrands([]);
        }
      };
      fetchBrands();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchBrands]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchCategories = async () => {
        const request: PaginationRequest = { search: searchCategories };
        try {
          const data = await GetCategories(request);
          setCategories(data.data.categories);
        } catch (err) {
          console.error(err);
          setCategories([]);
        }
      };
      fetchCategories();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchCategories]);

  const handleChangeFileCount = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 8) {
      setResult("En fazla 8 adet dosya seçebilirsiniz.");
      e.target.value = "";
      setValue("files", []);
      return;
    }

    setValue("files", selectedFiles);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setResult("");
    try {
      if (data.name.length < 10) throw new Error("Ürün adı minimum 10 karakter olmalı.");
      if (data.description.length < 250) throw new Error("Ürün açıklaması minimum 250 karakter olmalı.");
      if (!data.brand) throw new Error("Lütfen marka seçiniz.");
      if (!data.category) throw new Error("Lütfen kategori seçiniz.");
      if (data.stock < 1) throw new Error("Geçersiz stok");
      if (data.files.length < 1) throw new Error("Resim yüklemeniz gerekmektedir.");

  
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("stock", data.stock.toString());
      // Kullanıcıdan gelen price TL cinsinden, API'ye cent (integer) olarak gönderiyoruz
      const priceInCents = Math.round((data.price ?? 0) * 100);
      formData.append("price", priceInCents.toString());
      formData.append("brand", data.brand.value.toString());
      formData.append("category", data.category.value.toString());
      if (data.features && data.features.length > 0) {
        formData.append("features", JSON.stringify(data.features));
      }
      // Dosyaları ekle
      files.forEach((file) => formData.append("images", file));
      await addProduct(formData);
      setResult("Ürün başarıyla eklendi.");
      setStep(3);
    } catch (err: unknown) {
      if (err instanceof Error) setResult(err.message);
      else setResult("Bir hata oluştu.");
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextstep = () => setStep(step + 1);
  const prevstep = () => setStep(step - 1);
  const comeBack = () => setStep(1);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  })

  // Progress stepper component
  const ProgressStepper = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                step >= stepNum
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              {step > stepNum ? (
                <CheckCircle2 size={24} />
              ) : (
                <span className="font-semibold">{stepNum}</span>
              )}
            </div>
            {stepNum < 2 && (
              <div
                className={`w-24 h-1 mx-2 transition-all duration-300 ${
                  step > stepNum ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-12">
        <span className={`text-sm font-medium ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
          Temel Bilgiler
        </span>
        <span className={`text-sm font-medium ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
          Özellikler
        </span>
      </div>
    </div>
  );

  // Custom select styles
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "48px",
      border: state.isFocused ? "2px solid #3b82f6" : "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        border: "2px solid #3b82f6",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      padding: "12px 16px",
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <FormProvider {...methods}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <Package className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Yeni Ürün Ekle</h1>
            <p className="text-gray-600">Ürününüzü detaylı bir şekilde ekleyin ve satışa başlayın</p>
          </div>

          {/* Progress Stepper */}
          {step < 3 && <ProgressStepper />}

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Ürün Bilgileri Card */}
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Tag className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Ürün Bilgileri</h2>
                        <p className="text-sm text-gray-500">Temel ürün bilgilerini girin</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Ürün Adı */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ürün Adı <span className="text-red-500">*</span>
                        </label>
                        <Input 
                          {...register("name", { required: "Ürün adı zorunludur" })} 
                          placeholder="Örn: iPhone 15 Pro Max 256GB"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.name.message}
                          </p>
                        )}
                        {watch("name") && (
                          <p className="text-xs text-gray-500 mt-1">
                            {watch("name").length}/10 karakter (minimum 10)
                          </p>
                        )}
                      </div>

                      {/* Açıklama */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Açıklama <span className="text-red-500">*</span>
                        </label>
                        <Input
                          as="textarea"
                          {...register("description", { required: "Açıklama zorunludur" })}
                          placeholder="Ürününüzü detaylı bir şekilde açıklayın..."
                          className="min-h-[120px]"
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.description.message}
                          </p>
                        )}
                        {watch("description") && (
                          <p className="text-xs text-gray-500 mt-1">
                            {watch("description").length}/250 karakter (minimum 250)
                          </p>
                        )}
                      </div>

                      {/* Marka ve Kategori Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Marka <span className="text-red-500">*</span>
                          </label>
                          <Select
                            options={brands?.map((b) => ({ label: b.name, value: b.id }))}
                            value={watch("brand")}
                            onChange={(option) =>
                              setValue("brand", option as { value: number; label: string } | null)
                            }
                            onInputChange={(val) => setSearchBrands(val)}
                            placeholder="Marka seçin..."
                            isClearable
                            styles={customSelectStyles}
                            noOptionsMessage={() => "Sonuç bulunamadı"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Kategori <span className="text-red-500">*</span>
                          </label>
                          <Select
                            options={categories?.map((c) => ({ label: c.name, value: c.id }))}
                            value={watch("category")}
                            onChange={(option) =>
                              setValue("category", option as { value: number; label: string } | null)
                            }
                            onInputChange={(val) => setSearchCategories(val)}
                            placeholder="Kategori seçin..."
                            isClearable
                            styles={customSelectStyles}
                            noOptionsMessage={() => "Sonuç bulunamadı"}
                          />
                        </div>
                      </div>

                      {/* Fiyat ve Stok Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fiyat (₺) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              className="pl-10"
                              {...register("price", { 
                                required: "Fiyat zorunludur",
                                min: {
                                  value: 0.01,
                                  message: "Fiyat 0.01'den küçük olamaz"
                                },
                                validate: (value) => {
                                  if (value == null || value <= 0) {
                                    return "Fiyat pozitif bir sayı olmalıdır";
                                  }
                                  const decimalPlaces = (value.toString().split('.')[1] || '').length;
                                  if (decimalPlaces > 2) {
                                    return "Fiyat en fazla 2 ondalık haneli olabilir";
                                  }
                                  return true;
                                }
                              })}
                              placeholder="0.00"
                            />
                          </div>
                          {errors.price && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle size={14} />
                              {errors.price.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Stok (Opsiyonel)
                          </label>
                          <div className="relative">
                            <Box className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input 
                              type="number" 
                              min={1} 
                              className="pl-10"
                              {...register("stock")} 
                              placeholder="1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ürün Resimleri Card */}
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ImagePlus className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Ürün Resimleri</h2>
                        <p className="text-sm text-gray-500">En fazla 8 adet fotoğraf</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Input
                        id="fileinput"
                        hidden
                        type="file"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleChangeFileCount}
                      />
                      
                      {files.length === 0 ? (
                        <label
                          htmlFor="fileinput"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="text-gray-400 group-hover:text-blue-500 mb-4" size={48} />
                            <p className="mb-2 text-sm text-gray-500 group-hover:text-blue-600">
                              <span className="font-semibold">Fotoğrafları yüklemek için tıklayın</span> veya sürükleyip bırakın
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX 8 dosya)</p>
                          </div>
                        </label>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {files.map((file, idx) => (
                              <div key={idx} className="relative group">
                                <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                                  <Image
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFiles = files.filter((_, i) => i !== idx);
                                    setValue("files", newFiles);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                >
                                  <X size={16} />
                                </button>
                                <p className="text-xs text-gray-600 mt-1 truncate" title={file.name}>
                                  {file.name}
                                </p>
                              </div>
                            ))}
                          </div>
                          {files.length < 8 && (
                            <label
                              htmlFor="fileinput"
                              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all text-sm text-gray-600 hover:text-blue-600"
                            >
                              <FileImage size={20} />
                              Daha fazla fotoğraf ekle ({files.length}/8)
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Result Message */}
                {result && (
                  <div className={`p-4 rounded-lg flex items-center gap-2 ${
                    result.includes("başarıyla") 
                      ? "bg-green-50 text-green-800 border border-green-200" 
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}>
                    {result.includes("başarıyla") ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    <span>{result}</span>
                  </div>
                )}

                {/* Next Button */}
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={nextstep}
                    className="rounded-xl px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    Sonraki Adım
                    <ArrowRight size={20} />
                  </Button>
                </div>
              </div>
            )}



          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Settings className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ürün Özellikleri</h2>
                    <p className="text-sm text-gray-500">Ürününüzü öne çıkaracak özellikleri eksiksiz ve doğru şekilde belirtin</p>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              {!category ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-4 bg-yellow-100 rounded-full mb-4">
                      <AlertCircle className="text-yellow-600" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Kategori Seçimi Gerekli</h3>
                    <p className="text-gray-600">Özellik eklemek için önce bir kategori seçmeniz gerekmektedir.</p>
                    <Button 
                      type="button" 
                      onClick={prevstep}
                      className="mt-6 rounded-xl px-6 py-2 flex items-center gap-2"
                    >
                      <ArrowLeft size={18} />
                      Kategori Seçmek İçin Geri Dön
                    </Button>
                  </div>
                </div>
              ) : !attributes || attributes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-4 bg-orange-100 rounded-full mb-4">
                      <AlertCircle className="text-orange-600" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Özellik Bulunamadı</h3>
                    <p className="text-gray-600">Seçtiğiniz kategoriye ait özellik bulunmamaktadır.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Features List */}
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {fields.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-blue-100 rounded-full inline-flex mb-4">
                          <Sparkles className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Özellik Eklenmedi</h3>
                        <p className="text-gray-600 mb-6">Ürününüzü daha iyi tanıtmak için özellik ekleyin</p>
                        <Button
                          type="button"
                          onClick={() => append({ key: {label: "", value:0}, value: "" })}
                          className="rounded-xl px-6 py-3 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all"
                        >
                          <Plus size={20} />
                          İlk Özelliği Ekle
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Eklenen Özellikler ({fields.length})
                          </h3>
                          <Button
                            type="button"
                            onClick={() => append({ key: {label: "", value:0}, value: "" })}
                            className="rounded-xl px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                          >
                            <Plus size={18} />
                            Yeni Özellik Ekle
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {fields.map((field, index) => (
                            <div 
                              key={field.id} 
                              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Özellik <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                      options={attributes?.map((b) => ({ label: b.attribute_name, value: b.attribute_id }))}
                                      value={watch(`features.${index}.key`)}
                                      onChange={(option) => {
                                        const selected = option && typeof option === "object" ? option as FeatureKey : { label: "", value: 0};
                                        setValue(`features.${index}.key`, selected, { shouldDirty: true });
                                      }}
                                      onInputChange={(val) => setSearchBrands(val)}
                                      placeholder="Özellik seçin..."
                                      isClearable
                                      styles={customSelectStyles}
                                      noOptionsMessage={() => "Sonuç bulunamadı"}
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Değer <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                      {...register(`features.${index}.value` as const)}
                                      placeholder="Örn: 256GB, 8GB RAM, 128GB"
                                      className="w-full"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 flex-shrink-0"
                                  title="Özelliği Sil"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Result Message */}
                  {result && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 shadow-md ${
                      result.includes("başarıyla") 
                        ? "bg-green-50 text-green-800 border border-green-200" 
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {result.includes("başarıyla") ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <AlertCircle size={20} />
                      )}
                      <span className="font-medium">{result}</span>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between gap-4 pt-4">
                    <Button 
                      type="button" 
                      onClick={prevstep}
                      className="rounded-xl px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <ArrowLeft size={20} />
                      Önceki Adım
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="rounded-xl px-8 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Ürünü Yükle
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

        </form>
      </FormProvider>

      {/* Success Step */}
      {step === 3 && (
        <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-100 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg animate-pulse">
                <BadgeCheck className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Başarılı!</h1>
            <p className="text-lg text-gray-600 mb-8">{result}</p>
            <div className="space-y-3">
              <Button 
                type="button" 
                onClick={() => router.push("/profile/products")}
                className="w-full rounded-xl px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                Ürünlerime Git
              </Button>
              <Button 
                type="button" 
                onClick={comeBack}
                className="w-full rounded-xl px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              >
                Yeni Ürün Ekle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Step */}
      {step === 4 && (
        <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-100 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mb-4 shadow-lg">
                <AlertCircle className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Hata Oluştu</h1>
            <p className="text-lg text-gray-600 mb-8">{result}</p>
            <Button 
              type="button" 
              onClick={comeBack}
              className="w-full rounded-xl px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};


