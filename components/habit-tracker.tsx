"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Languages, Moon, Sun, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Toaster, toast, useToasterStore } from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Habit {
  id: number
  name: string
  daysWithout: number
}

type Language = "en" | "ar"
type Theme = "light" | "dark"

const translations = {
  en: {
    title: "Bad Habits Tracker",
    addHabit: "Add Habit",
    enterHabit: "Enter a new habit",
    daysWithout: "Days without:",
    increaseDays: "Increase Days",
    habitAdded: "Habit added successfully!",
    habitRemoved: "Habit removed.",
    enterHabitError: "Please enter a habit before adding",
    previous: "Previous",
    next: "Next",
    toggleLanguage: "Toggle language",
    toggleTheme: "Toggle theme",
    noHabits: "No habits added yet. Start by adding a new habit!",
    maxHabitsReached: "You've reached the maximum number of habits.",
    deleteConfirmTitle: "Are you sure?",
    deleteConfirmDescription: "This action cannot be undone. This will permanently delete the habit.",
    cancel: "Cancel",
    confirm: "Confirm",
    reset: "Reset All",
    resetConfirmTitle: "Reset All Habits",
    resetConfirmDescription: "This will delete all your habits. Are you sure you want to continue?",
  },
  ar: {
    title: "متتبع العادات السيئة",
    addHabit: "إضافة العادة",
    enterHabit: "أدخل العادة جديدة",
    daysWithout: "الأيام بدون ممارسة:",
    increaseDays: "زيادة الأيام",
    habitAdded: "تمت إضافة العادة بنجاح",
    habitRemoved: "تمت إزالة العادة",
    enterHabitError: "يرجى إدخال العادة قبل الإضافة",
    previous: "السابق",
    next: "التالي",
    toggleLanguage: "تغيير اللغة",
    toggleTheme: "تغيير المظهر",
    noHabits: "لم تتم إضافة أي عادات بعد. ابدأ بإضافة عادة جديدة!",
    maxHabitsReached: "لقد وصلت إلى الحد الأقصى من العادات.",
    deleteConfirmTitle: "هل أنت متأكد؟",
    deleteConfirmDescription: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف العادة نهائيًا.",
    cancel: "إلغاء",
    confirm: "تأكيد",
    reset: "إعادة تعيين الكل",
    resetConfirmTitle: "إعادة تعيين جميع العادات",
    resetConfirmDescription: "سيؤدي هذا إلى حذف جميع عاداتك. هل أنت متأكد أنك تريد المتابعة؟",
  },
}

const ITEMS_PER_PAGE = 3
const MAX_HABITS = 10
const TOAST_LIMIT = 2

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState("")
  const [lang, setLang] = useState<Language>("en")
  const [theme, setTheme] = useState<Theme>("light")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<number | null>(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const { toasts } = useToasterStore()

  const t = translations[lang]

  useEffect(() => {
    const storedLang = localStorage.getItem("lang") as Language
    if (storedLang && (storedLang === "en" || storedLang === "ar")) {
      setLang(storedLang)
    }

    const storedTheme = localStorage.getItem("theme") as Theme
    if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
      setTheme(storedTheme)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }

    const storedHabits = localStorage.getItem("habits")
    if (storedHabits) {
      try {
        setHabits(JSON.parse(storedHabits))
      } catch (error) {
        console.error("Error parsing stored habits:", error)
        localStorage.removeItem("habits")
      }
    }

    // Load Arabic font
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    localStorage.setItem("lang", lang)
    document.documentElement.lang = lang
    document.body.dir = lang === "ar" ? "rtl" : "ltr"
    document.body.style.fontFamily = lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "inherit"
  }, [lang])

  useEffect(() => {
    localStorage.setItem("theme", theme)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= TOAST_LIMIT)
      .forEach((t) => toast.dismiss(t.id))
  }, [toasts])

  const addHabit = () => {
    if (habits.length >= MAX_HABITS) {
      toast.error(t.maxHabitsReached, { duration: 2000 })
      return
    }
    if (newHabit.trim() !== "") {
      const habit = { id: Date.now(), name: newHabit, daysWithout: 0 }
      const updatedHabits = [...habits, habit]
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))
      toast.success(t.habitAdded, { duration: 2000 })
      setNewHabit("")
    } else {
      toast.error(t.enterHabitError, { duration: 2000 })
    }
  }

  const removeHabit = (id: number) => {
    setHabitToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (habitToDelete !== null) {
      const updatedHabits = habits.filter((habit) => habit.id !== habitToDelete)
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))
      toast(t.habitRemoved, { icon: "🗑️", duration: 2000 })
      setDeleteConfirmOpen(false)
      setHabitToDelete(null)
    }
  }

  const resetAllHabits = () => {
    setResetConfirmOpen(true)
  }

  const confirmReset = () => {
    setHabits([])
    localStorage.removeItem("habits")
    toast.success(t.habitRemoved, { duration: 2000 })
    setResetConfirmOpen(false)
  }

  const incrementDays = (id: number) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, daysWithout: habit.daysWithout + 1 } : habit
    )
    setHabits(updatedHabits)
    localStorage.setItem("habits", JSON.stringify(updatedHabits))
  }

  const toggleLanguage = () => {
    setLang((prevLang) => {
      const newLang = prevLang === "en" ? "ar" : "en"
      localStorage.setItem("lang", newLang)
      return newLang
    })
  }

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light"
      localStorage.setItem("theme", newTheme)
      return newTheme
    })
  }

  const totalPages = Math.max(1, Math.ceil(habits.length / ITEMS_PER_PAGE))
  const displayedHabits = habits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 ${
        lang === "ar" ? "font-arabic" : ""
      }`}
    >
      <Toaster
        position={lang === "ar" ? "top-left" : "top-right"}
        toastOptions={{
          duration: 2000,
          style: {
            background: theme === "dark" ? "#333" : "#fff",
            color: theme === "dark" ? "#fff" : "#333",
          },
        }}
      />
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-2xl transition-colors duration-300">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-center w-full text-gray-900 dark:text-white transition-colors duration-300">
            {t.title}
          </h1>
          <div className={`flex ${lang === "ar" ? "space-x-reverse space-x-2" : "space-x-2"}`}>
            <Button onClick={toggleLanguage} variant="outline" size="icon" aria-label={t.toggleLanguage}>
              <Languages className="h-5 w-5" />
            </Button>
            <Button onClick={toggleTheme} variant="outline" size="icon" aria-label={t.toggleTheme}>
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        <div className="flex mb-6">
          <Input
            type="text"
            placeholder={t.enterHabit}
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className={`${
              lang === "ar" ? "ml-2" : "mr-2"
            } flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300`}
            aria-label={t.enterHabit}
            maxLength={50}
          />
          <Button onClick={addHabit} aria-label={t.addHabit}>
            <Plus className={lang === "ar" ? "ml-2" : "mr-2"} />
            {t.addHabit}
          </Button>
        </div>
        {habits.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">{t.noHabits}</p>
        ) : (
          <div className="space-y-4">
            {displayedHabits.map((habit) => (
              <Card key={habit.id} className="shadow-md border rounded-lg transition-colors duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2 border-b">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    {habit.name}
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeHabit(habit.id)}
                    aria-label={`Remove ${habit.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      {t.daysWithout} {habit.daysWithout}
                    </span>
                    <Button onClick={() => incrementDays(habit.id)} aria-label={`Increase days for ${habit.name}`}>
                      {t.increaseDays}
                    </Button>
                  </div>
                  <Progress value={(habit.daysWithout / 30) * 100} className="w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {habits.length > ITEMS_PER_PAGE && (
          <div className="flex justify-between mt-4">
            <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
              {t.previous}
            </Button>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
              {t.next}
            </Button>
          </div>
        )}
        {habits.length > 0 && (
          <div className="mt-6 text-center">
            <Button onClick={resetAllHabits} variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4"   />
              {t.reset}
            </Button>
          </div>
        )}
      </div>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.resetConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.resetConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>{t.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}