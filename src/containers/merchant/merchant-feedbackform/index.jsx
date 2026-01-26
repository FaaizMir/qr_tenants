"use client"

import React, { useState } from "react"
import { Check, Facebook, Instagram, Linkedin, Minus, Pencil, Plus, Trash, Save } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MerchantFeedbackFormContainer = () => {
    // Preset Reviews State
    const [presetToggle, setPresetToggle] = useState(false)
    const [presetReviews, setPresetReviews] = useState([])
    const [newReview, setNewReview] = useState("")
    const [editingIndex, setEditingIndex] = useState(null)
    const [editValue, setEditValue] = useState("")

    // Comments State
    const [commentsToggle, setCommentsToggle] = useState(false)

    // Social Media State
    const [socialToggle, setSocialToggle] = useState(false)
    const [socialPlatforms, setSocialPlatforms] = useState({
        instagram: false,
        facebook: false,
        linkedin: false,
    })

    // Preset Reviews Handlers
    const handleAddReview = () => {
        if (!newReview.trim()) return
        if (presetReviews.length >= 10) return

        setPresetReviews([...presetReviews, newReview.trim()])
        setNewReview("")
    }

    const handleDeleteReview = (index) => {
        const updated = presetReviews.filter((_, i) => i !== index)
        setPresetReviews(updated)
    }

    const startEditing = (index) => {
        setEditingIndex(index)
        setEditValue(presetReviews[index])
    }

    const saveEdit = (index) => {
        if (!editValue.trim()) return
        const updated = [...presetReviews]
        updated[index] = editValue.trim()
        setPresetReviews(updated)
        setEditingIndex(null)
    }

    const cancelEdit = () => {
        setEditingIndex(null)
        setEditValue("")
    }

    // Social Media Handler
    const togglePlatform = (platform) => {
        setSocialPlatforms(prev => ({
            ...prev,
            [platform]: !prev[platform]
        }))
    }

    // Main Save Handler
    const handleSaveForm = () => {
        const formData = {
            presetConfig: {
                enabled: presetToggle,
                reviews: presetToggle ? presetReviews : []
            },
            commentsConfig: {
                enabled: commentsToggle
            },
            socialConfig: {
                enabled: socialToggle,
                platforms: socialToggle ? socialPlatforms : { instagram: false, facebook: false, linkedin: false }
            }
        }

        console.log("Saving Form Data:", formData)
        // Here you would typically send this to an API
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Feedback Form Configuration</h2>
                    <p className="text-muted-foreground">Customize how your feedback form looks and behaves.</p>
                </div>
                <Button onClick={handleSaveForm} size="lg" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            {/* Preset Reviews Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Preset Reviews</CardTitle>
                        <CardDescription>Allow customers to choose from predefined positive reviews</CardDescription>
                    </div>
                    <Switch
                        checked={presetToggle}
                        onCheckedChange={setPresetToggle}
                    />
                </CardHeader>
                {presetToggle && (
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex gap-4 items-end">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="new-review">Add New Preset Review ({presetReviews.length}/10)</Label>
                                <Input
                                    id="new-review"
                                    placeholder="e.g., Great Service!"
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    disabled={presetReviews.length >= 10}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddReview()}
                                />
                            </div>
                            <Button
                                onClick={handleAddReview}
                                disabled={presetReviews.length >= 5 || !newReview.trim()}
                                variant="secondary"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {presetReviews.map((review, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                    {editingIndex === index ? (
                                        <div className="flex items-center gap-2 w-full mr-2">
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="h-8"
                                                autoFocus
                                            />
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveEdit(index)}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={cancelEdit}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                                                    {index + 1}
                                                </Badge>
                                                <span className="font-medium">{review}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => startEditing(index)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => handleDeleteReview(index)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {presetReviews.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No preset reviews added yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Comments Configuration */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Comments Section</CardTitle>
                        <CardDescription>Enable a text area for customers to write detailed feedback</CardDescription>
                    </div>
                    <Switch
                        checked={commentsToggle}
                        onCheckedChange={setCommentsToggle}
                    />
                </CardHeader>
            </Card>

            {/* Social Media Configuration */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Social Media Links</CardTitle>
                        <CardDescription>Display selected social media icons on the feedback form</CardDescription>
                    </div>
                    <Switch
                        checked={socialToggle}
                        onCheckedChange={setSocialToggle}
                    />
                </CardHeader>
                {socialToggle && (
                    <CardContent className="pt-6">
                        <div className="flex justify-center gap-8 py-4">
                            <SocialIcon
                                active={socialPlatforms.instagram}
                                onClick={() => togglePlatform('instagram')}
                                icon={<Instagram className="h-8 w-8" />}
                                label="Instagram"
                            />
                            <SocialIcon
                                active={socialPlatforms.facebook}
                                onClick={() => togglePlatform('facebook')}
                                icon={<Facebook className="h-8 w-8" />}
                                label="Facebook"
                            />
                            <SocialIcon
                                active={socialPlatforms.linkedin}
                                onClick={() => togglePlatform('linkedin')}
                                icon={<Linkedin className="h-8 w-8" />}
                                label="LinkedIn"
                            />
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}

const SocialIcon = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
            active
                ? "border-primary bg-primary/5 text-primary shadow-sm"
                : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
    >
        <div className={cn(
            "p-3 rounded-full transition-colors",
            active ? "bg-primary text-primary-foreground" : "bg-background"
        )}>
            {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
    </button>
)

export default MerchantFeedbackFormContainer
