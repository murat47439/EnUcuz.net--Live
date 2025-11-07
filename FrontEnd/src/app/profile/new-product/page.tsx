"use client"
import React, { useEffect, useState } from "react";
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
import { ImagePlus, FileImage, BadgeCheck,BadgeAlertIcon } from "lucide-react";
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

  const handleChangeFileCount = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    try {
      if (data.name.length < 10) throw new Error("Ürün adı minimum 10 karakter olmalı.");
      if (data.description.length < 250) throw new Error("Ürün açıklaması minimum 250 karakter olmalı.");
      if (!data.brand) throw new Error("Lütfen marka seçiniz.");
      if (!data.category) throw new Error("Lütfen kategori seçiniz.");
      if (data.stock < 1) throw new Error("Geçersiz stok");
  
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("stock", data.stock.toString());
      formData.append("price", data.price?.toString() ?? "0");
      formData.append("brand", data.brand.value.toString());
      formData.append("category", data.category.value.toString());
      if (data.features && data.features.length > 0) {
        formData.append("features", JSON.stringify(data.features));
      }
      // Dosyaları ekle
      files.forEach((file) => formData.append("images", file));
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }
      await addProduct(formData);
      setResult("Ürün başarıyla eklendi.");
      nextstep();
    } catch (err: unknown) {
      if (err instanceof Error) setResult(err.message);
      else setResult("Bir hata oluştu.");
      setStep(4);
    }
  };

  const nextstep = () => setStep(step + 1);
  const prevstep = () => setStep(step - 1);
  const comeBack = () => setStep(1);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  })

  return (
    <div className="p-8">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] justify-around w-auto p-4 gap-4 ml-auto">

                {/* Ürün Bilgileri */}
                <div>
                  <h2 className="text-center font-semibold">Ürün bilgileri</h2>
                  <h4 className="text-center text-gray-600">
                    Ürün bilgilerini detaylı ve anlaşılır şekilde ekleyin.
                  </h4>

                  {/* Ürün Adı */}
                  <label className="grid grid-cols-2 gap-4 items-center mt-6">
                    Ürün adı
                    <Input {...register("name", { required: "Ürün adı zorunludur" })} />
                  </label>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}

                  {/* Açıklama */}
                  <label className="grid grid-cols-2 gap-4 items-center mt-6">
                    Açıklama
                    <Input
                      as="textarea"
                      {...register("description", { required: "Açıklama zorunludur" })}
                    />
                  </label>
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}

                  {/* Marka */}
                  <label className="grid grid-cols-2 gap-4 items-center mt-6">
                    Marka
                    <Select
                      options={brands?.map((b) => ({ label: b.name, value: b.id }))}
                      value={watch("brand")}
                      onChange={(option) =>
                        setValue("brand", option as { value: number; label: string } | null)
                      }
                      onInputChange={(val) => setSearchBrands(val)}
                      placeholder="Marka seçin..."
                      isClearable
                      noOptionsMessage={() => "Sonuç bulunamadı"}
                    />
                  </label>

                  {/* Kategori */}
                  <label className="grid grid-cols-2 gap-4 items-center mt-6">
                    Kategori
                    <Select
                      options={categories?.map((c) => ({ label: c.name, value: c.id }))}
                      value={watch("category")}
                      onChange={(option) =>
                        setValue("category", option as { value: number; label: string } | null)
                      }
                      onInputChange={(val) => setSearchCategories(val)}
                      placeholder="Kategori seçin..."
                      isClearable
                      noOptionsMessage={() => "Sonuç bulunamadı"}
                    />
                  </label>

                  {/* Fiyat */}
                  <label className="grid grid-cols-2 gap-4 items-center mt-6">
                    Fiyat
                    <Input
                      type="number"
                      min={0.01}
                      {...register("price", { required: "Fiyat zorunludur" })}
                    />
                  </label>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}

                  {/* Stok */}
                  <label className="grid grid-cols-2 gap-4 items-center mt-6">
                    Stok (opsiyonel)
                    <Input type="number" min={1} {...register("stock")} />
                  </label>
                </div>

                {/* Dikey çizgi */}
                <div className="border-l hidden sm:block w-0.5 border-gray-100"></div>

                {/* Ürün Resimleri */}
                <div>
                  <h2 className="text-center font-semibold">Ürün Resimleri</h2>
                  <h4 className="text-center text-gray-600">
                    En fazla 8 adet fotoğraf yükleyebilirsiniz.
                  </h4>
                  <ImagePlus className="mt-10 mx-auto" size={75} />

                  <Input
                    id="fileinput"
                    hidden
                    type="file"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleChangeFileCount}
                  />
                  <label
                    htmlFor="fileinput"
                    className="cursor-pointer px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-800 flex gap-4 items-center mx-auto mt-6 shadow-sm"
                  >
                    <FileImage size={30} />
                    Fotoğrafları yükle (MAX 8)
                  </label>

                  {files.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg shadow"
                          />
                          <p className="text-center text-gray-600 text-sm">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
              <p className="text-center text-black mt-4 pb-4">{result}</p>
              <Button type="button" className="rounded-full" onClick={nextstep}>Sonraki adım</Button>
            </div>
            // 🔹 step === 1 grid burada kapanıyor
          )}



          {step === 2 && (
            <div>
              <div>
                <h2 className="text-center font-semibold">Ürün Özellikleri</h2>
                <h4 className="text-center text-gray-600 mb-8">
                  Ürününüzü öne çıkaracak özellikleri eksiksiz ve doğru şekilde belirtin.
                </h4>
                <button
                  type="button"
                  onClick={() => append({ key: {label: "", value:0}, value: "" })}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full text-white px-4 py-2 fixed right-8 bottom-8 z-10 shadow"
                >
                  Yeni Özellik Ekle
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {!category ? (
                    <h1 className="font-bold text-center w-full col-span-2">
                      Kategori seçmeniz gerekir
                    </h1>
                  ) : !attributes || attributes.length === 0 ? (
                    <h1 className="font-bold text-center w-full col-span-2">
                      Bu kategoriye ait özellik bulunamadı
                    </h1>
                  ) : (
                    <>
                      <h1 className="col-span-2 text-center font-extrabold px-2">Özellik Eklemeye Başlamak İçin &quot;Yeni Özellik Ekle&quot; Butonuna Basın</h1>

                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center p-4 col-span-2 sm:col-span-1">
                          <Select
                      options={attributes?.map((b) => ({ label: b.attribute_name, value: b.attribute_id }))}
                      value={watch(`features.${index}.key`)}
                      className="w-full p-2"
                     onChange={(option) => {
                        const selected = option && typeof option === "object" ? option as FeatureKey : { label: "", value: 0};
                        setValue(`features.${index}.key`, selected, { shouldDirty: true });
                      }}
                      onInputChange={(val) => setSearchBrands(val)}
                      placeholder="Özellik seçin..."
                      isClearable
                      noOptionsMessage={() => "Sonuç bulunamadı"}
                    />
                            
                            
    

                          <Input
                            {...register(`features.${index}.value` as const)}
                            placeholder="Değer"
                            className="border p-2 rounded-lg min-w-2"
                          />

                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="bg-red-600 hover:bg-red-700 p-2 text-white px-2 rounded-full"
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </>
                  )}



                </div>
              </div>

              <p className="text-center text-black mt-4 pb-4">{result}</p>
              <div className="grid grid-cols-2 gap-4">

                <Button type="button" className="rounded-full" onClick={prevstep}>Önceki adım</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 rounded-full">Ürünü Yükle</Button>
              </div>

            </div>


          )}

        </form>
      </FormProvider>
          {step === 3 && (
            <div className="w-full grid grid-cols-1 place-items-center">
              <BadgeCheck size={150} />
              <h1 className="text-center font-extrabold">{result}</h1>
            </div>
          )}
          {step === 4 && (
            <div className="w-full grid grid-cols-1 place-items-center">
              <BadgeAlertIcon size={150} />
              <h1 className="text-center font-extrabold">{result}</h1>
              <Button type="button" className="mt-8" onClick={comeBack}>Geri Dön</Button>
            </div>
          )}
    </div>
  );



};


