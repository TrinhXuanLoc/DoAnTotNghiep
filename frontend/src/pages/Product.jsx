import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ProductCart from "../components/ProductCart";
import Loading from "../components/Loading";
import Footer from "../components/Footer";
import { Pagination } from "antd";

function Product() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get("category");
  const nameParam = searchParams.get("name");
  const products = useSelector((state) => state.product);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let delay = 300;
    setTimeout(() => {
      if (products) {
        const res = products.data;
        setIsLoading(false);
        return setProductData(res);
      }
    }, delay);
  }, [products]);

  const [productData, setProductData] = useState(null);

  useEffect(() => {
    if (!productData) return;
    let filteredData = productData;
    if (categoryParam) {
      filteredData = productData.filter(
        (item) => item.category === categoryParam
      );
    }
    if (nameParam) {
      filteredData = productData.filter((item) =>
        item.name.toLowerCase().includes(nameParam.toLowerCase())
      );
    }
    setData(filteredData);
    setCurrentPage(1);
  }, [categoryParam, productData, nameParam]);

  const [data, setData] = useState([]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Loading isLoading={isLoading}>
      <div className="bg-[#f4f1f4] md:min-h-[100vh]">
        <div className="grid grid-cols-2 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 md:p-6">
          {currentItems.length !== 0 ? (
            currentItems.map((item, index) => (
              <ProductCart key={index} item={item} />
            ))
          ) : (
            <div className="flex w-full justify-center items-center">
              <h1 className="font-[600]">Không có sản phẩm</h1>
            </div>
          )}
        </div>
        {currentItems.length !== 0 && (
          <div className="grid grid-cols-1 justify-center items-center text-center py-4">
            <Pagination
              current={currentPage}
              total={data.length}
              pageSize={itemsPerPage}
              onChange={handlePageChange}
            />
          </div>
        )}
        <Footer />
      </div>
    </Loading>
  );
}

export default Product;