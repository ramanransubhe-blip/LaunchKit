import { test } from "node:test";
import * as assert from "node:assert";
import {
  createSupabaseStorageService,
  createS3StorageService,
  setGlobalStorageService,
  getGlobalStorageService,
} from "../src/index.js";
import {
  StorageProviderError,
  isStorageError,
} from "../src/core/errors.js";
import {
  uploadFileAction,
  createFolderAction,
} from "../src/server/actions.js";

test("Supabase Storage adapter mock flow", async () => {
  const service = createSupabaseStorageService({ isMock: true });
  assert.equal(service.providerName, "supabase-storage");

  const up = await service.upload("avatars", "user1/profile.jpg", "image-bytes-data", { contentType: "image/jpeg" });
  assert.equal(up.path, "user1/profile.jpg");
  assert.ok(up.url.includes("mock.supabase.co"));

  const dl = await service.download("avatars", "user1/profile.jpg");
  assert.equal(dl.contentType, "text/plain");
  assert.equal(dl.data.toString(), "Mock file downloaded content");

  const list = await service.list("avatars", "user1");
  assert.equal(list.length, 2);
  assert.equal(list[0].name, "file1.txt");

  const sign = await service.generateSignedUrl("avatars", "user1/profile.jpg", 60);
  assert.ok(sign.includes("sign/avatars/user1/profile.jpg"));
});

test("S3 Storage adapter mock flow", async () => {
  const service = createS3StorageService({ isMock: true });
  assert.equal(service.providerName, "aws-s3");

  const up = await service.upload("buckets", "doc.pdf", "pdf-data");
  assert.ok(up.url.includes("amazonaws.com"));
});

test("Global registrar check", async () => {
  assert.throws(
    () => getGlobalStorageService(),
    /No global StorageService registered/
  );
});

test("Storage server actions simulation", async () => {
  const service = createSupabaseStorageService({ isMock: true });
  setGlobalStorageService(service);

  // Success path
  const response = await uploadFileAction(
    {
      bucket: "docs",
      path: "manual.md",
      isPublic: true,
    },
    Buffer.from("markdown content").toString("base64")
  );
  assert.equal(response.success, true);
  assert.ok(response.data?.url.includes("manual.md"));

  // Failure validation path due to missing parameters
  const failResponse = await uploadFileAction(
    {
      bucket: "",
      path: "",
    },
    ""
  );
  assert.equal(failResponse.success, false);
  assert.equal(failResponse.error?.code, "STORAGE_INTERNAL_ERROR");
});
