"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Languages, Moon, Sun, RotateCcw, Heart, Lightbulb, Bell, BellOff, X, ArrowUp } from 'lucide-react'
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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Habit {
  id: number
  name: string
  daysCount: number
  isHealthy: boolean
  creationDate: Date
  lastCongratulated: {
    week: number
    twoWeeks: number
    threeWeeks: number
    month: number
  }
}

type Language = "en" | "ar"
type Theme = "light" | "dark"
type Filter = "all" | "healthy" | "unhealthy"

const habitTips = {
  en: [
    "Start small: Focus on one habit at a time.",
    "Be consistent: Try to practice your habit at the same time each day.",
    "Use reminders: Set alarms or leave notes to help you remember your habit.",
    "Track your progress: Seeing your improvements can be very motivating.",
    "Be patient: It takes time to form a new habit, usually about 21 days.",
    "Reward yourself: Celebrate your successes, no matter how small.",
    "Don't be too hard on yourself: If you miss a day, just start again tomorrow.",
    "Make it easy: Remove obstacles that might prevent you from doing your habit.",
    "Pair your habit: Connect your new habit with an existing one.",
    "Visualize success: Imagine yourself successfully completing your habit.",
  ],
  ar: [
    "ابدأ بخطوات صغيرة: ركز على عادة واحدة في كل مرة.",
    "كن متسقًا: حاول ممارسة عادتك في نفس الوقت كل يوم.",
    "استخدم التذكيرات: اضبط المنبهات أو اترك ملاحظات لمساعدتك على تذكر عادتك.",
    "تتبع تقدمك: رؤية تحسيناتك يمكن أن تكون محفزة للغاية.",
    "كن صبورًا: يستغرق الأمر وقتًا لتكوين عادة جديدة، عادة حوالي 21 يومًا.",
    "كافئ نفسك: احتفل بنجاحاتك، مهما كانت صغيرة.",
    "لا تكن قاسيًا على نفسك: إذا فاتك يوم، فقط ابدأ من جديد غدًا.",
    "اجعل الأمر سهلاً: أزل العقبات التي قد تمنعك من ممارسة عادتك.",
    "اربط عادتك: اربط عادتك الجديدة بعادة موجودة بالفعل.",
    "تخيل النجاح: تخيل نفسك وأنت تكمل عادتك بنجاح.",
  ],
}

const translations = {
  en: {
    title: "Habit Tracker",
    addHabit: "Add Habit",
    enterHabit: "Enter a new habit",
    daysWithout: "Days without:",
    daysStreak: "Days streak:",
    increaseDays: "Increase Days",
    decreaseDays: "Decrease Days",
    increaseAllDays: "Increase All Days",
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
    healthyHabit: "Healthy Habit",
    unhealthyHabit: "Unhealthy Habit",
    filterAll: "All Habits",
    filterHealthy: "Healthy Habits",
    filterUnhealthy: "Unhealthy Habits",
    noHealthyHabits: "No healthy habits added yet. Start by adding a new healthy habit!",
    noUnhealthyHabits: "No unhealthy habits added yet. Start by adding a new unhealthy habit!",
    congratulationsWeek: "Great job! You've maintained this habit for a week!",
    congratulationsTwoWeeks: "Impressive! You've kept up with this habit for two weeks!",
    congratulationsThreeWeeks: "Amazing progress! You've stuck with this habit for three weeks!",
    congratulationsMonth: "Congratulations! You've maintained this habit for a month!",
    week: "week",
    weeks: "weeks",
    month: "month",
    characterEncouragement: "You're doing great! Keep it up!",
    characterName: "Habby the Habit Helper",
    characterHover: "Hi there! I'm Habby!",
    getTip: "Get a Tip",
    tipTitle: "Habit Tip",
    habitTips: habitTips.en,
    enableReminders: "Enable Reminders",
    disableReminders: "Disable Reminders",
    reminderMessage: "Time to check on your habits!",
    createdOn: "Created on:",
    allHabitsIncreased: "All habits increased by one day!",
  },
  ar: {
    title: "متتبع العادات",
    addHabit: "إضافة العادة",
    enterHabit: "أدخل العادة جديدة",
    daysWithout: "الأيام بدون ممارسة:",
    daysStreak: "أيام متتالية:",
    increaseDays: "زيادة الأيام",
    decreaseDays: "تقليل الأيام",
    increaseAllDays: "زيادة جميع الأيام",
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
    healthyHabit: "عادة صحية",
    unhealthyHabit: "عادة غير صحية",
    filterAll: "جميع العادات",
    filterHealthy: "العادات الصحية",
    filterUnhealthy: "العادات غير الصحية",
    noHealthyHabits: "لم تتم إضافة عادات صحية بعد. ابدأ بإضافة عادة صحية جديدة!",
    noUnhealthyHabits: "لم تتم إضافة عادات غير صحية بعد. ابدأ بإضافة عادة غير صحية جديدة!",
    congratulationsWeek: "عمل رائع! لقد حافظت على هذه العادة لمدة أسبوع!",
    congratulationsTwoWeeks: "مثير للإعجاب! لقد واظبت على هذه العادة لمدة أسبوعين!",
    congratulationsThreeWeeks: "تقدم مذهل! لقد التزمت بهذه العادة لمدة ثلاثة أسابيع!",
    congratulationsMonth: "تهانينا! لقد حافظت على هذه العادة لمدة شهر!",
    week: "أسبوع",
    weeks: "أسابيع",
    month: "شهر",
    characterEncouragement: "أنت تقوم بعمل رائع! واصل التقدم!",
    characterName: "هابي مساعد العادات",
    characterHover: "مرحبًا! أنا هابي!",
    getTip: "احصل على نصيحة",
    tipTitle: "نصيحة للعادات",
    habitTips: habitTips.ar,
    enableReminders: "تفعيل التذكيرات",
    disableReminders: "إيقاف التذكيرات",
    reminderMessage: "حان الوقت للتحقق من عاداتك!",
    createdOn: "تم إنشاؤها في:",
    allHabitsIncreased: "تمت زيادة جميع العادات بيوم واحد!",
  },
}

const ITEMS_PER_PAGE = 4
const MAX_HABITS = 10
const TOAST_LIMIT = 2
const REMINDER_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

const sendNotification = (message: string) => {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Habit Tracker", {
          body: message,
          icon: "/favicon.ico" // Make sure you have a favicon.ico in your public folder
        });
      }
    });
  }
};

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState("")
  const [isHealthy, setIsHealthy] = useState(false)
  const [lang, setLang] = useState<Language>("en")
  const [theme, setTheme] = useState<Theme>("light")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<number | null>(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>("all")
  const [remindersEnabled, setRemindersEnabled] = useState(false)
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

    const storedRemindersEnabled = localStorage.getItem("remindersEnabled")
    if (storedRemindersEnabled) {
      setRemindersEnabled(JSON.parse(storedRemindersEnabled))
    }

    const storedIsHealthy = localStorage.getItem("isHealthy")
    if (storedIsHealthy !== null) {
      setIsHealthy(JSON.parse(storedIsHealthy))
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

  useEffect(() => {
    const checkAndSendReminder = () => {
      const lastReminderTime = localStorage.getItem("lastReminderTime")
      const now = Date.now()

      if (!lastReminderTime || now - parseInt(lastReminderTime) >= REMINDER_INTERVAL) {
        sendNotification(t.reminderMessage)
        localStorage.setItem("lastReminderTime", now.toString())
      }
    }

    let intervalId: NodeJS.Timeout | null = null

    if (remindersEnabled) {
      checkAndSendReminder() // Check immediately when enabled
      intervalId = setInterval(checkAndSendReminder, REMINDER_INTERVAL)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [remindersEnabled, t.reminderMessage])

  const addHabit = () => {
    if (habits.length >= MAX_HABITS) {
      toast.error(t.maxHabitsReached, { duration: 2000 })
      return
    }
    if (newHabit.trim() !== "") {
      const habit = { 
        id: Date.now(),
        name: newHabit,
        daysCount: 1, 
        isHealthy,
        creationDate: new Date(),
        lastCongratulated: {
          week: 0,
          twoWeeks: 0,
          threeWeeks: 0,
          month: 0
        }
      }
      const updatedHabits = [...habits, habit]
      setHabits(updatedHabits)
      localStorage.setItem("habits", JSON.stringify(updatedHabits))
      toast.success(t.habitAdded, {
        duration: 2000,
        icon: '🎉',
      })
      setNewHabit("")
      setIsHealthy(false)
      setCurrentPage(Math.ceil(updatedHabits.length / ITEMS_PER_PAGE))
      setFilter("all")
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
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        const newDaysCount = habit.daysCount + 1
        const now = Date.now()
        let congratMessage = ''

        if (newDaysCount === 7 && now - habit.lastCongratulated.week > 7 * 24 * 60 * 60 * 1000) {
          congratMessage = t.congratulationsWeek
          habit.lastCongratulated.week = now
        } else if (newDaysCount === 14 && now - habit.lastCongratulated.twoWeeks > 14 * 24 * 60 * 60 * 1000) {
          congratMessage = t.congratulationsTwoWeeks
          habit.lastCongratulated.twoWeeks = now
        } else if (newDaysCount === 21 && now - habit.lastCongratulated.threeWeeks > 21 * 24 * 60 * 60 * 1000) {
          congratMessage = t.congratulationsThreeWeeks
          habit.lastCongratulated.threeWeeks = now
        } else if (newDaysCount === 30 && now - habit.lastCongratulated.month > 30 * 24 * 60 * 60 * 1000) {
          congratMessage = t.congratulationsMonth
          habit.lastCongratulated.month = now
        }

        if (congratMessage) {
          toast.success(congratMessage, {
            duration: 5000,
            icon: '🎉',
          })
        }

        return {
          ...habit,
          daysCount: newDaysCount,
        }
      }
      return habit
    })
    setHabits(updatedHabits)
    localStorage.setItem("habits", JSON.stringify(updatedHabits))
  }

  const decrementDays = (id: number) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id && habit.daysCount > 0) {
        return {
          ...habit,
          daysCount: habit.daysCount - 1,
        }
      }
      return habit
    })
    setHabits(updatedHabits)
    localStorage.setItem("habits", JSON.stringify(updatedHabits))
  }

  const incrementAllDays = () => {
    const updatedHabits = habits.map(habit => ({...habit, daysCount: habit.daysCount + 1}))
    setHabits(updatedHabits)
    localStorage.setItem("habits", JSON.stringify(updatedHabits))
    toast.success(t.allHabitsIncreased, {
      duration: 2000,
      icon: '🎉',
    })
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

  const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * t.habitTips.length)
    toast.success(t.habitTips[randomIndex], {
      duration: 5000,
      icon: '💡',
    })
  }

  const toggleReminders = () => {
    setRemindersEnabled((prev) => {
      const newValue = !prev
      localStorage.setItem("remindersEnabled", JSON.stringify(newValue))
      if (newValue && "Notification" in window) {
        Notification.requestPermission()
      }
      toast.success(newValue ? t.enableReminders : t.disableReminders, {
        icon: newValue ? '🔔' : '🔕',
        duration: 2000,
      })
      return newValue
    })
  }

  const toggleIsHealthy = useCallback(() => {
    setIsHealthy((prev) => {
      const newValue = !prev
      localStorage.setItem("isHealthy", JSON.stringify(newValue))
      return newValue
    })
  }, [])

  const filteredHabits = habits.filter((habit) => {
    if (filter === "all") return true;
    if (filter === "healthy") return habit.isHealthy;
    if (filter === "unhealthy") return !habit.isHealthy;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredHabits.length / ITEMS_PER_PAGE));
  const displayedHabits = filteredHabits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))

  return (
    <div className={`flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 ${
      lang === "ar" ? "font-arabic" : ""
    }`}>
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {t.title}
          </h1>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button onClick={toggleLanguage} variant="outline" size="icon" aria-label={t.toggleLanguage}>
              <Languages className="h-5 w-5" />
            </Button>
            <Button onClick={toggleTheme} variant="outline" size="icon" aria-label={t.toggleTheme}>
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button onClick={toggleReminders} variant="outline" size="icon" aria-label={remindersEnabled ? t.disableReminders : t.enableReminders}>
              {remindersEnabled ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow p-4 md:p-6 container mx-auto max-w-4xl">
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: theme === "dark" ? "#333" : "#fff",
              color: theme === "dark" ? "#fff" : "#333",
            },
          }}
        />
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 rtl:space-x-reverse">
            <Input
              type="text"
              placeholder={t.enterHabit}
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
              aria-label={t.enterHabit}
              maxLength={50}
            />
            <Button onClick={addHabit} className="w-full md:w-auto">
              <Plus className="mr-2 rtl:ml-2 rtl:mr-0" />
              {t.addHabit}
            </Button>
          </div>
          <Button
            onClick={toggleIsHealthy}
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              isHealthy ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800' : 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800'
            }`}
          >
            {isHealthy ? (
              <>
                <Heart className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                {t.healthyHabit}
              </>
            ) : (
              <>
                <X className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                {t.unhealthyHabit}
              </>
            )}
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select value={filter} onValueChange={(value: Filter) => setFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterAll} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filterAll}</SelectItem>
                <SelectItem value="healthy">{t.filterHealthy}</SelectItem>
                <SelectItem value="unhealthy">{t.filterUnhealthy}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={getRandomTip}>
              <Lightbulb className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t.getTip}
            </Button>
          </div>
        </div>
        {filteredHabits.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {filter === "all" ? t.noHabits : filter === "healthy" ? t.noHealthyHabits : t.noUnhealthyHabits}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedHabits.map((habit) => (
              <Card key={habit.id} className="flex flex-col shadow-md border rounded-lg transition-colors duration-300">
                <CardHeader className="flex items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 flex items-center">
                    {habit.isHealthy && <Heart className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4 text-green-500" />}
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
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      {habit.isHealthy ? t.daysStreak : t.daysWithout} {habit.daysCount}
                    </span>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button onClick={() => decrementDays(habit.id)} aria-label={`Decrease days for ${habit.name}`} variant="outline" size="sm">
                        -
                      </Button>
                      <Button onClick={() => incrementDays(habit.id)} aria-label={`Increase days for ${habit.name}`} size="sm">
                        +
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={(habit.daysCount / 30) * 100} 
                    className={`w-full ${habit.isHealthy ? 'bg-green-200 dark:bg-green-900' : 'bg-red-200 dark:bg-red-900'}`}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t.createdOn} {new Date(habit.creationDate).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {filteredHabits.length > ITEMS_PER_PAGE && (
          <div className="flex justify-between mt-6">
            <Button onClick={handlePreviousPage} disabled={currentPage === 1} className="w-24">
              {t.previous}
            </Button>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages} className="w-24">
              {t.next}
            </Button>
          </div>
        )}
        {habits.length > 0 && (
          <div className="mt-6 space-y-2">
            <Button onClick={incrementAllDays} className="w-full">
              <ArrowUp className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
              {t.increaseAllDays}
            </Button>
            <Button onClick={resetAllHabits} variant="outline" className="w-full">
              <RotateCcw className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
              {t.reset}
            </Button>
          </div>
        )}
      </main>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">{t.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              {t.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 rtl:space-x-reverse">
            <AlertDialogCancel className="mt-2 sm:mt-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 text-white hover:bg-red-600">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">{t.resetConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              {t.resetConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 rtl:space-x-reverse">
            <AlertDialogCancel className="mt-2 sm:mt-0 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="bg-red-500 text-white hover:bg-red-600">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

