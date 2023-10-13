import React, { useEffect, useState } from "react";
import { getaProduct } from "../../service/productService";
import Rating from "../Rating";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { UserOutlined } from "@ant-design/icons";
import { format } from "date-fns";
import Loading from "../Loading";
import { useDispatch, useSelector } from "react-redux";
import ProductCart from "./ProductCart";
import { increaseQuantity } from "../../redux/action/cartAction";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function ProductDetail(id) {
  const { data } = useSelector((state) => state.product);
  const dataEvent = useSelector((state) => state.event);
  const user = useSelector((state) => state.user);
  const _id = id?.id;
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0);
  const [dataProduct, setDataProduct] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [dataReviews, setDataReviews] = useState(null);
  const [productData, setProductData] = useState(null);
  const navigate = useNavigate();
  const getProduct = async () => {
    const res = await getaProduct(_id);
    setDataProduct(res);
  };
  useEffect(() => {
    getProduct();
  }, [id]);
  useEffect(() => {
    const eventId = dataEvent.data.map((item) => {
      return {
        idProductEvent: item.product[0]._id,
        discount: item.discount,
      };
    });
    const foundEvent = eventId.find(
      (eventItem) => eventItem.idProductEvent === _id
    );
    if (foundEvent && dataProduct) {
      const updatedProduct = {
        ...dataProduct?.product,
        distCount: foundEvent.discount + dataProduct?.product.distCount,
      };
      setProductData(updatedProduct);
    } else {
      setProductData(dataProduct?.product);
    }
  }, [dataEvent, _id, dataProduct]);
  const handleIncrease = () => {
    setQuantity((pre) => pre + 1);
  };
  const handleDecrease = () => {
    setQuantity((pre) => pre - 1);
  };
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  const productPrice =
    productData?.originPrice * (1 - productData?.distCount / 100);

  useEffect(() => {
    if (dataProduct && dataProduct.success) {
      setDataReviews(dataProduct?.product?.reviews);
    }
  }, [dataProduct, _id]);
  const handleAddToCart = () => {
    if (!user?.isAuthenticated) {
      navigate("/login");
    } else {
      if (quantity > 0) {
        dispatch(
          increaseQuantity({
            _id: productData?._id,
            name: productData?.name,
            description: productData?.description,
            price: productPrice,
            disCount: productData?.distCount,
            image: productData?.images[0].url,
            quantityProduct: productData?.quantity,
            quantity,
          })
        );
        toast.success("Đã thêm sản phẩm vào giỏ hàng");
      }
    }
  };

  return (
    <div className=" mb-10">
      <p className="text-[80%] md:text-[100%] font-[600] md:px-[10%]">
        Sản phẩm
      </p>
      <div className="w-full flex flex-col  md:flex-row md:justify-between md:px-[10%]">
        <div className=" md:w-[50%] w-[100%] flex justify-center text-center">
          {productData && (
            <img
              src={productData?.images[0].url}
              alt=""
              className="sm:w-[280px] md:w-[320px] w-[120px] object-contain"
            />
          )}
        </div>
        <div className="w-full sm:m-2 px-[4%]">
          <p className="md:text-xl text-xs font-[700] ">{productData?.name}</p>
          <div className="flex items-center">
            <p className="pr-1"> {productData?.ratings}</p>
            <Rating rating={productData?.ratings} />
          </div>
          <span className="flex items-center">
            <p className="mr-2">Đã bán</p>
            <p className="font-bold">{productData?.sold_out}</p>
          </span>
          <div className="flex">
            {productData?.distCount ? (
              <>
                <h1 className="line-through font-bold text-red-600 pr-2">
                  {productData?.originPrice.toLocaleString()}đ
                </h1>
                <h1 className="font-bold">{productPrice.toLocaleString()}đ</h1>
              </>
            ) : (
              <h1 className="font-bold">
                {dataProduct?.product?.originPrice.toLocaleString()}
              </h1>
            )}
          </div>
          <div className="flex items-center">
            <button
              className="p-2 flex items-center border bg-[#f9f9f9]"
              onClick={handleDecrease}
              disabled={quantity <= 0}
            >
              <MinusOutlined />
            </button>
            <p className="p-2 flex items-center font-bold h-full">{quantity}</p>
            <button
              className="p-2 flex items-center border bg-[#f9f9f9]"
              onClick={handleIncrease}
              disabled={quantity >= dataProduct?.product.quantity}
            >
              <PlusOutlined />
            </button>
            <button
              className="bg-[#73c509] p-1 border mx-2 font-[600] text-white px-2"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
          <div className="relative">
            <p className="text-[60%] md:text-[100%] font-[600]">
              Chi tiết sản phẩm
            </p>
            <div
              className={`shadow shadow-[#a8a7a7] ${
                expanded ? "h-auto" : "h-[4vh] overflow-hidden"
              }`}
            >
              <ul className="text-[60%] md:text-[100%]">
                {dataProduct?.product?.description.map((item, index) => {
                  return (
                    <li className="ml-2" key={index}>
                      • {item}
                    </li>
                  );
                })}
              </ul>
            </div>
            <p
              className="absolute bottom-[-20px] w-full text-center text-blue-600 cursor-pointer pl-4 text-[60%] md:text-[100%] "
              onClick={toggleExpand}
            >
              {expanded ? "Thu gọn" : "Xem thêm"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:px-[10%]">
        <p className="font-[600] md:text-[100%] text-[50%]">
          Sản phẩm tương tự
        </p>
        <div className="flex ">
          <div className="grid grid-cols-2 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 md:p-6">
            {data && data.length > 0
              ? data
                  .filter(
                    (item) =>
                      item.category.categoryid._id ===
                        dataProduct?.product.category.categoryid._id &&
                      item._id !== dataProduct.product._id
                  )
                  .map((item, index) => <ProductCart item={item} key={index} />)
              : null}
          </div>
        </div>
      </div>

      <div className="w-full md:px-[10%]">
        <div className="relative">
          <p className="md:text-[100%] text-[50%] font-[600]">Đánh giá</p>
          <div className="shadow shadow-[#a8a7a7] w-full">
            <div className="bg-[#73c509] py-1 px-1  items-center text-white">
              <span className="flex items-center px-1">
                {dataProduct?.product?.ratings ? (
                  <p className="md:text-[150%] text-[50%] font-[600]">
                    {dataProduct?.product?.ratings}
                  </p>
                ) : (
                  <p className="md:text-[150%] text-[50%] font-[600]">5</p>
                )}

                <p className="md:text-[100%] text-[40%] pl-1"> trên 5</p>
              </span>
              <div className="text-[10px] md:text-[14px] ">
                <Rating rating={dataProduct?.product?.ratings} />
              </div>
            </div>
            {dataReviews?.map((review) => {
              return (
                <div key={review._id} className="w-full py-1 px-1 border-b-2">
                  <div className="flex w-full items-center ">
                    {review && review.user?.avatar?.url ? (
                      <img
                        src={review.user.avatar.url}
                        alt=""
                        className=" md:w-[40px] md:h-[40px] w-[30px] h-[30px] rounded-[50%] mr-1 "
                      />
                    ) : (
                      <div className="border rounded-[50%] ">
                        <UserOutlined className="text-[24px] p-2 text-[#73C509]" />
                      </div>
                    )}
                    <div className=" flex flex-col w-full">
                      <p className="md:text-[100%] text-[50%]">
                        {review?.user?.name}
                      </p>
                      <span className=" text-[8px] md:text-[10px]">
                        <Rating rating={review?.rating} />
                      </span>
                      <p className="md:text-[100%] text-[40%] ">
                        {review.createAt
                          ? format(new Date(review.createAt), "dd/MM/yyyy")
                          : null}
                      </p>
                      <p className="md:text-[100%] text-[40%]">
                        {review?.comment}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;