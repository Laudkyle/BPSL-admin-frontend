import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage, { MainPage } from "./Homepage";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Stories from "./Pages/Stories";
import Careers from "./Pages/Careers";
import Awards from "./Pages/Awards";
import Branches from "./Pages/Branches";
import Notices from "./Pages/Notices";
import Products from "./Pages/Products";
import CategoryManager from "./Pages/Categories";
import TeamsTable from "./Pages/Teams";
import {ContentManagerTabs} from "./Pages/Stories";
import GalleryImagesManager from "./Pages/GalleryManager";
import BranchesManager from "./Pages/Branches";


function Pages({ toggleSidebar }) {
  return (
    <Routes>
      <Route path="/" element={<MainPage toggleSidebar={toggleSidebar} />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />}/>
      <Route path="/about/awards" element={<Awards />}/>
      <Route path="/products" element={<Products />}/>
      <Route path="/categories" element={<CategoryManager />}/>
      <Route path="/notices" element={<Notices />}/>
      <Route path="/settings/branches" element={<BranchesManager />}/>
      <Route path="/awards" element={<Awards />}/>
      <Route path="/careers" element={<Careers />}/>
      <Route path="/stories" element={<ContentManagerTabs />}/>
      <Route path="/stories/gallery" element={<GalleryImagesManager />}/>
      <Route path="about/teams" element={<TeamsTable />}/>
    </Routes>
  );
}

export default Pages;
