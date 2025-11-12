import React from 'react'
import { useToast } from '@/context/toastContext'
import { useState, useEffect } from 'react'
import { AddProdAttributes, CategoryAttribute, Features } from '@/lib/types/types'
import { getCategoryAttributes } from '@/lib/api/attributes/useGetsCats'
import Button from '@/features/components/button'
import Select from 'react-select'
import Input from '@/features/components/input'
import { Product } from '@/lib/types/types'
import { addProdAttribute } from '@/lib/api/attributes/useAddProd'
import { useRouter } from 'next/navigation'

type Props = {
  data: Product;
}

export default function AttributeSelect({ data }: Props) {
    const [attributes, setAttributes] = useState<CategoryAttribute[]>([])
    const [fields, setFields] = useState<Features>([])
    const { showNotification } = useToast()
    const router = useRouter()
    useEffect(() => {
      if (!data?.category_id) return
  
      const fetchAttributes = async () => {
        try {
          const res = await getCategoryAttributes({ id: data.category_id })
          setAttributes(res.data.category_attributes)
        } catch (err) {
          console.error(err)
          setAttributes([])
        }
      }
  
      fetchAttributes()
    }, [data])
  
    const append = () => {
      setFields([...fields, { key: { label: '', value: 0 }, value: '' }])
    }
  
    const remove = (index: number) => {
      setFields(fields.filter((_, i) => i !== index))
    }

        const onSubmit = async () => {
        const request: AddProdAttributes = {
        product_id: data.id!,
        attributes: fields.map(field => {
            const attr = attributes.find(a => a.attribute_id === field.key.value)
            return {
            key: {
                label: attr!.attribute_name,
                value: attr!.attribute_id
            },
            value: field.value
            }
        })
        }
      try{
        console.log(request)
        const response = await addProdAttribute(request)
        console.log(response)

        showNotification(response.message, 'success')
        if (response.success) {
          showNotification(response.message, 'success')
          setFields([])
        }else{
          showNotification(response.message, 'error')
        }
      }catch(err){
        console.error(err)
      }
    
  }
  
  return (
    <div className='h-96'>
      <h2 className="text-center font-semibold mb-4">Ürün Özellikleri</h2>

      <button
        type="button"
        onClick={append}
        className="bg-blue-600 hover:bg-blue-700 rounded-full text-white px-4 py-2 fixed right-8 bottom-8 z-10 shadow"
      >
        Yeni Özellik Ekle
      </button>

      <div className="flex flex-col gap-4 mt-6">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-2 items-center">
             <Select
              options={attributes.map(attr => ({ label: attr.attribute_name, value: attr.attribute_id }))}
              placeholder="Özellik seçin..."
              value={field.key.value ? { label: field.key.label, value: field.key.value } : null}
              isClearable
              onChange={option => {
                const newFields = [...fields]
                newFields[index].key = option as { label: string, value: number }
                setFields(newFields)
              }}
              className="w-full"
            />
            <Input
            onChange={e => {
                const newFields = [...fields]
                newFields[index].value = e.target.value
                setFields(newFields)
              }}
              value={field.value}
              placeholder="Değer"
              className="flex-1"
            />
            <Button type="button" onClick={() => remove(index)} className="bg-red-600 hover:bg-red-700 text-white px-3 rounded-full">
              Sil
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" onClick={() => {onSubmit(); router.refresh()}} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">
        Özellikleri Kaydet
      </Button>
    </div>
  )
}
