<?php
/**
 * Template part for displaying posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package WPAdmin
 */
?>

<div class="row">
    <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="x_panel">
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

                <div class="x_title">
                    <div class="row">
                        <div class="col-md-10">
                            <h2>
                                <?php
                                if (is_singular()) :
                                    the_title('<h1 class="entry-title">', '</h1>');
                                else :
                                    the_title('<h2 class="entry-title"><a href="' . esc_url(get_permalink()) . '" rel="bookmark">', '</a></h2>');
                                endif;
                                ?>
                            </h2><!-- .entry-header -->
                        </div>
                        <div class="col-md-2">
                            <div>
                                <?php
                                if ('post' === get_post_type()) :
                                    ?>
                                    <div class="entry-meta">
                                        <?php
                                        wpadmin_posted_on();
                                        wpadmin_posted_by();
                                        ?>
                                    </div><!-- .entry-meta -->
                                <?php endif; ?>
                            </div><!-- .entry-header -->
                        </div>

                        <div class="clearfix"></div>
                    </div>
                </div>

                <div class="x_content">
                    <div class="row">
                        <div class="col-md-12">
                            <?php wpadmin_post_thumbnail('medium'); ?>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <?php
                            the_content(sprintf(
                                wp_kses(
                                /* translators: %s: Name of current post. Only visible to screen readers */
                                    __('Continue reading<span class="screen-reader-text"> "%s"</span>', 'wpadmin'),
                                    array(
                                        'span' => array(
                                            'class' => array(),
                                        ),
                                    )
                                ),
                                get_the_title()
                            ));

                            wp_link_pages(array(
                                'before' => '<div class="page-links">' . esc_html__('Pages:', 'wpadmin'),
                                'after' => '</div>',
                            ));
                            ?>
                        </div>
                    </div>
                </div>

            </article><!-- #post-<?php the_ID(); ?> -->
        </div>
    </div>
</div>
