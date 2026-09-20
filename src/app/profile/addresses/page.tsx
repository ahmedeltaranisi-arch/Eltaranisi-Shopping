"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import {
  MapPin,
  Plus,
  SquarePen,
  Trash2,
  Phone,
  Building2,
} from "lucide-react";
import AddressModal from "@/app/_components/AddressModal/AddressModal";
import DeleteAddressModal from "@/app/_components/DeleteAddressModal/DeleteAddressModal";
import {
  getUserAddresses,
  deleteAddress,
  type AddressType,
} from "@/app/_apis/profile.api";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    address?: AddressType;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AddressType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAddresses = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      setAddresses(await getUserAddresses());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  function openAdd() {
    setModal({ mode: "add" });
  }

  function openEdit(address: AddressType) {
    setModal({ mode: "edit", address });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAddress(deleteTarget._id);
      toast.success("Address deleted successfully");
      setDeleteTarget(null);
      await loadAddresses(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete address");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section>
      {/* ===== Page head ===== */}
      <div
        suppressHydrationWarning
        className="flex items-center justify-between gap-4 mb-4"
        data-aos="fade-up"
      >
        <div>
          <h2 className="text-lg font-extrabold text-[#14171A]">
            My Addresses
          </h2>
          <p className="text-xs text-[#8A857B] mt-0.5">
            Manage your saved delivery addresses
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#00B250] hover:bg-[#009B4D] text-white text-[13px] font-bold rounded-lg px-4 py-2.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {/* ===== Loading ===== */}
      {loading ? (
        <div className="flex justify-center py-20">
          <BeatLoader size={12} color="#00B250" />
        </div>
      ) : error ? (
        /* ===== Error ===== */
        <div className="bg-white border border-[#E7E5E1] rounded-xl py-14 px-6 text-center">
          <h3 className="text-base font-extrabold text-[#14171A]">
            Something went wrong
          </h3>
          <p className="text-[13px] text-[#8A857B] mt-1.5">{error}</p>
          <button
            onClick={() => loadAddresses()}
            className="mt-5 bg-[#00B250] hover:bg-[#009B4D] text-white text-[13px] font-bold rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : addresses.length === 0 ? (
        /* ===== Empty state ===== */
        <div
          suppressHydrationWarning
          className="bg-white border border-[#E7E5E1] rounded-xl py-16 px-6 text-center"
          data-aos="fade-up"
        >
          <div className="w-20 h-20 rounded-full bg-[#F1F2F4] text-[#B3BAC4] flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-[#14171A] mt-5">
            No Addresses Yet
          </h3>
          <p className="text-[13px] text-[#8A857B] mt-1.5 max-w-[350px] mx-auto leading-relaxed">
            Add your first delivery address to make checkout faster and easier.
          </p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-2 bg-[#00B250] hover:bg-[#009B4D] text-white text-[13px] font-bold rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Your First Address
          </button>
        </div>
      ) : (
        /* ===== Addresses list ===== */
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              suppressHydrationWarning
              key={address._id}
              className="bg-white border border-[#E7E5E1] rounded-xl p-4 flex gap-3.5 hover:shadow-md hover:border-[#B9E9CD] transition-all duration-200"
              data-aos="fade-up"
            >
              <div className="w-11 h-11 rounded-lg bg-[#E8F8EE] text-[#00B250] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-extrabold text-[#14171A]">
                  {address.name}
                </h4>
                <p className="text-xs text-[#8A857B] mt-0.5 break-words">
                  {address.details}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-[#8A857B]">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {address.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {address.city}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 shrink-0">
                <button
                  title="Edit address"
                  aria-label="Edit address"
                  onClick={() => openEdit(address)}
                  className="w-8 h-8 rounded-lg bg-[#F1F2F4] text-[#4B5563] hover:bg-[#E8F8EE] hover:text-[#00B250] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <SquarePen className="w-3.5 h-3.5" />
                </button>
                <button
                  title="Delete address"
                  aria-label="Delete address"
                  onClick={() => setDeleteTarget(address)}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Modals ===== */}
      {modal ? (
        <AddressModal
          mode={modal.mode}
          address={modal.address ?? null}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            loadAddresses(true);
          }}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteAddressModal
          address={deleteTarget}
          busy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </section>
  );
}
