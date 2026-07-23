import { createBrowserRouter, type RouteObject } from "react-router";
import Home from "@/pages/Home";
import App from "@/App";
import Products from "@/pages/Products";
import About from "@/pages/About";
import BlogIndex from "@/pages/BlogIndex";
import BlogPost from "@/pages/BlogPost";
import { loadBlog, loadBlogs } from "@/loaders/blog";

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: App,
    hydrateFallbackElement: <div>Loading...</div>,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: Products },
      { path: "about", Component: About },
      {
        path: "blog",
        children: [
          {
            index: true,
            Component: BlogIndex,
            loader: loadBlogs
          },
          { path: ":slug", Component: BlogPost, loader: loadBlog }
        ]
      }
    ]
  }
];

const router = createBrowserRouter(routes);

export default router;
