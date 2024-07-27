"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  CreateDNSRecord,
  RECORD_TYPE_ENUMS,
  RecordType,
  TTL_ENUMS,
} from "@/lib/cloudflare";
import { createRecordSchema } from "@/lib/validations/record";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";

import { FormSectionColumns } from "../dashboard/form-section-columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type FormData = CreateDNSRecord;

interface AddRecordFormProps {
  user: Pick<User, "id" | "name">;
}

export function AddRecordForm({ user }: AddRecordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isShow, setShow] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createRecordSchema),
    defaultValues: {
      type: "CNAME",
      ttl: 1,
      proxied: false,
    },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const response = await fetch("/api/record/add", {
        method: "POST",
        body: JSON.stringify({
          records: [data],
        }),
      });
      if (!response.ok || response.status !== 200) {
        toast.error("Add Record Failed", {
          description: response.statusText,
        });
      } else {
        const res = await response.json();
        toast.success(`Created record [${res?.name}] successfully`);
        setShow(false);
      }
    });
  });

  return isShow ? (
    <form
      className="rounded-lg border border-dashed p-4 shadow-sm animate-in fade-in-50"
      onSubmit={onSubmit}
    >
      <div className="items-center justify-start gap-4 md:flex">
        <FormSectionColumns title="Type">
          <Select
            onValueChange={(value: RecordType) => {}}
            name={"type"}
            defaultValue="CNAME"
            disabled
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {RECORD_TYPE_ENUMS.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="p-1 text-[13px] text-muted-foreground">
            Only supports CNAME.
          </p>
        </FormSectionColumns>
        <FormSectionColumns title="Name">
          <div className="flex w-full items-center gap-2">
            <Label className="sr-only" htmlFor="name">
              Name (required)
            </Label>
            <Input
              id="name"
              className="flex-1"
              size={32}
              {...register("name")}
            />
          </div>
          <div className="flex flex-col justify-between p-1">
            {errors?.name ? (
              <p className="pb-0.5 text-[13px] text-red-600">
                {errors.name.message}
              </p>
            ) : (
              <p className="pb-0.5 text-[13px] text-muted-foreground">
                Required. Use @ for root
              </p>
            )}
          </div>
        </FormSectionColumns>
        <FormSectionColumns title="Target">
          <div className="flex w-full items-center gap-2">
            <Label className="sr-only" htmlFor="target">
              Target
            </Label>
            <Input
              id="content"
              className="flex-1"
              size={32}
              {...register("content")}
            />
          </div>
          <div className="flex flex-col justify-between p-1">
            {errors?.content ? (
              <p className="pb-0.5 text-[13px] text-red-600">
                {errors.content.message}
              </p>
            ) : (
              <p className="pb-0.5 text-[13px] text-muted-foreground">
                Required. E.g. www.example.com
              </p>
            )}
          </div>
        </FormSectionColumns>
      </div>

      <div className="flex items-center justify-between gap-4">
        <FormSectionColumns title="TTL">
          <Select
            onValueChange={(value: RecordType) => {}}
            name={"ttl"}
            defaultValue="1"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {TTL_ENUMS.map((ttl) => (
                <SelectItem key={ttl.value} value={ttl.value}>
                  {ttl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="p-1 text-[13px] text-muted-foreground">
            Optional. Time To Live.
          </p>
        </FormSectionColumns>
        <FormSectionColumns title="Comment">
          <div className="flex items-center gap-2">
            <Label className="sr-only" htmlFor="comment">
              Comment
            </Label>
            <Input
              id="comment"
              className="flex-1"
              size={100}
              {...register("comment")}
            />
          </div>
          <p className="p-1 text-[13px] text-muted-foreground">
            Enter your comment here (up to 100 characters)
          </p>
        </FormSectionColumns>
        {/* <FormSectionColumns title="Proxy">
          <div className="flex w-full items-center gap-2">
            <Label className="sr-only" htmlFor="proxy">
              Proxy
            </Label>
            <Switch id="proxied" {...register("proxied")} />
          </div>
          <p className="p-1 text-[13px] text-muted-foreground">Proxy status</p>
        </FormSectionColumns> */}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="reset"
          variant={"destructive"}
          className="w-[80px] px-0"
          onClick={() => setShow(false)}
        >
          Cancle
        </Button>
        <Button
          type="submit"
          variant={"default"}
          disabled={isPending}
          className="w-[80px] shrink-0 px-0"
        >
          {isPending ? (
            <Icons.spinner className="size-4 animate-spin" />
          ) : (
            <p>Save</p>
          )}
        </Button>
      </div>
    </form>
  ) : (
    <Button
      className="w-[120px]"
      variant="default"
      onClick={() => setShow(true)}
    >
      Add record
    </Button>
  );
}
