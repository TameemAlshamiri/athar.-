# athar shop + admin panel

Files:
- index.html        the shop (loads items from /api/items)
- admin.html        the admin panel, opens at /admin
- api/              the server code (items, save, upload)
- package.json, vercel.json

## Setup (once, about 5 minutes)

1. Put ALL these files in your project (replace the old index.html), then deploy again:
   - GitHub: upload/commit the files to your repo; Vercel redeploys by itself.
   - Or from the folder: run `npx vercel --prod`.
2. Vercel dashboard > your project > Storage > Create > Blob.
   Choose access: PUBLIC. Connect it to the project (this adds BLOB_READ_WRITE_TOKEN).
3. Vercel dashboard > your project > Settings > Environment Variables:
   add ADMIN_PASSWORD = a long password only you know. Apply to Production.
4. Redeploy (Deployments > ... > Redeploy) so the new variables apply.
5. Open https://athar-six-tau.vercel.app/admin and log in.

## Using it
Set your WhatsApp number, press "+ Add item", fill the form, add a photo,
then press "Publish changes". The shop updates within seconds.
